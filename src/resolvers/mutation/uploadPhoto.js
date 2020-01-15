// const fs = require('fs');
// const os = require('os');
// const path = require('path');
const sharp = require('sharp');
const { Storage } = require('@google-cloud/storage');
const { ApolloError, AuthenticationError } = require('apollo-server-express');

const uploadPhoto = async (_, args, context) => {
  const { isValid, db, id, logger, userLoader } = context;

  if (isValid) {
    const { createReadStream, mimetype } = await args.photo;
    const stream = createReadStream();
    const user = await userLoader.load(id);

    logger(args);
    const storage = new Storage();
    const myBucket = storage.bucket(
      process.env.NODE_ENV === 'production' ? 'aurora-dp' : 'aurora-stg-dp'
    );

    const mimeTypes = ['image/png', 'image/jpeg'];
    logger('[UPLOAD]', 'mime=>', mimetype);
    if (!mimeTypes.includes(mimetype)) throw new ApolloError('Invalid filetype', 'INCORRECT_MIME');

    const fileName = `${id.replace(/-/g, '').toLowerCase()}-${Math.floor(
      Math.random() * 899999 + 100000
    )}.png`;
    const gcFile = myBucket.file(fileName);

    try {
      const transformer = sharp()
        .resize({ width: 250, height: 250 })
        .png()
        .on('error', err => {
          logger('[UP_ERR][SHARP]', err);
        });

      await stream.pipe(transformer).pipe(
        gcFile.createWriteStream({
          metadata: {
            contentType: 'image/png',
            metadata: {
              cacheControl: 'public, max-age=31536000',
            },
          },
        })
      );
      myBucket.file(user.displayPic).delete();
    } catch (err) {
      logger('[UP_ERR]', err);
      throw new ApolloError('File upload failed', 'UPLOAD_FAILED');
    } finally {
      userLoader.clear(id);
    }

    await db.collection('users').updateOne({ _id: id }, { $set: { displayPic: fileName } });

    return {
      code: 200,
      success: true,
      message: 'Display Picture updated successfully',
      user: {
        id,
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = uploadPhoto;
