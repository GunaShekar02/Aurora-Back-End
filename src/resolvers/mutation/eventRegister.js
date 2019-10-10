const { UserInputError } = require('apollo-server-express');
ObjectId = require('mongodb').ObjectID;

const eventRegister = async (_, args, context) => {
  const { isValid, db } = context;
  let { userId, eventId } = args;
  userId = ObjectId(userId);
  eventId = ObjectId(eventId);

    if(isValid){
        const Event = await db
        .collection('events')
        .find({ _id: eventId })
        .toArray();
        // console.log(Event);
        if(Event[0]){
            const User = await db
            .collection('users')
            .find({ _id: userId })
            .toArray();
            console.log(User);
      
         const singleEvent = await db
            .collection('users')
            .find({ 'teams.event._id': eventId })
            .toArray();
          if(!singleEvent[0]){
              const updatedUser = await db.collection('users').updateOne(
                  { _id: userId },
                  {$push: {teams:{
                      _id:ObjectId(Math.random(12)),
                      name: User[0].name, 
                      event: Event[0],
                      members:User[0].name, 
                      paymentStatus: false
                  }}},
                   { new: true }
              );    
              if(updatedUser){
                  return{
                      code: 200,
                      success: true,
                      message: 'Event registered successfully',
                      user: User[0],
                    };
              }
          }
          throw new UserInputError('Event registered already');
        }
        throw new UserInputError('Invalid EventId');       
    }
    throw new UserInputError('User is not logged in');  

    
};
module.exports = eventRegister;