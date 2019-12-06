const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    user: User!
  }

  type Event {
    id: Int!
    name: String!
    maxSize: Int!
    fee: Int!
    parentEvent: String
  }

  type User {
    id: String!
    email: String!
    name: String!
    college: String!
    gender: String!
    city: String!
    phone: String!
    displayPic: String!
    isVerified: Boolean!
    accommodation: Boolean!
    teams: [Team!]
    teamInvitations: [TeamInvitation!]
    timeSt: String!
  }

  type PublicUser {
    id: String!
    name: String!
    displayPic: String!
  }

  type Team {
    id: String!
    name: String
    event: Event!
    members: [PublicUser!]!
    paymentStatus: Boolean!
    pendingInvitations: [PublicUser!]
  }

  type TeamInvitation {
    team: Team!
    invitedBy: PublicUser!
  }

  type Mutation {
    login(email: String!, password: String!): String
    signup(
      email: String!
      password: String!
      name: String!
      college: String!
      gender: String!
      city: String!
      phone: String!
    ): UserResponse
    verifyRegister(token: String!): MutationResponse
    eventRegister(eventId: Int!): EventResponse
    sendInvite(teamId: String!, arId: String!): EventResponse
    cancelInvite(teamId: String!, arId: String!): EventResponse
    acceptInvite(teamId: String!): EventResponse
    declineInvite(teamId: String!): EventResponse
    removeMember(teamId: String!, arId: String!): EventResponse
    leaveTeam(teamId: String!): UserResponse
    pay(teamId: String!): UserResponse
    contactUs(name: String!, email: String!, subject: String, message: String!): MutationResponse
    forgotPassword(arIdOrEmail: String!): MutationResponse
    resetPassword(token: String!, password: String!): MutationResponse
  }

  type EventResponse {
    code: String
    success: Boolean!
    message: String
    team: Team!
  }

  type MutationResponse {
    code: String
    success: Boolean!
    message: String
  }

  type UserResponse {
    code: String
    success: Boolean!
    message: String
    user: User!
  }
`;

module.exports = typeDefs;
