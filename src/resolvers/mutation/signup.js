const { UserInputError } = require('apollo-server-express');
const bcrypt = require('bcrypt');

const signup = async (_, args, context) => {
  const { db } = context;
  const { email, password, name, college, phone } = args;

  // const Event = await db.collection('events').insertMany({
  //   id: 1,
  //   name: "Event_1",
  //   maxSize: 3,
  //   fee: 300
  // },{
  //   id: 2,
  //   name: "Event_2",
  //   maxSize: 5,
  //   fee: 500
  // });
  // console.log("event created");

  // const Event = await db
  // .collection('events') 
  // .find()
  // .toArray();
  // console.log(Event);


  const user = await db
    .collection('users') 
    .find({ email })
    .toArray();
  if (user.length === 0) {
    const payload = {
      email,
      name,
      college,
      phone,
      isVerified: false,
      accommodation: false,
      teams: [],
      teamInvitations: [],
    };

    const hash = await bcrypt.hash(password, 10);

    const res = await db.collection('users').insertOne({
      password: hash,
      ...payload,
    });

    return {
      code: 200,
      success: true,
      message: 'User registered successfully',
      user: {
        id: res.insertedId,
        ...payload,
      },
    };
  }
  throw new UserInputError('Email already exists');
};

module.exports = signup;
