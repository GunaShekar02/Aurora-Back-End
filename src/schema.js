const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    events: [Event!]
    user: User!
  }

  type Event {
    id: Int!
    name: String!
    maxSize: Int!
    fee: Int!
  }

  type User {
    id: String!
    email: String!
    name: String!
    college: String!
    phone: String!
    isVerified: Boolean!
    accommodation: Boolean!
    teams: [Team!]
    teamInvitations: [Team!]
  }

  type Team {
    id: String!
    name: String
    event: Event!
    members: [User!]!
    paymentStatus: Boolean!
  }

  type Mutation {
    login(email: String!, password: String!): String
    signup(
      email: String!
      password: String!
      name: String!
      college: String!
      phone: String!
    ): MutationResponse
    verify(email: String!, code: String!): MutationResponse
    eventRegister(eventId: Int!): EventResponse
    sendInvite(teamId: String!, arId: String!): EventResponse
    cancelInvite(teamId: String!, arId: String!): EventResponse
    acceptInvite(teamId: String!): EventResponse
    declineInvite(teamId: String!): EventResponse
    removeMember(teamId: String!, arId: String!): EventResponse
    leaveTeam(teamId: String!): EventResponse
    pay(teamId: String!): MutationResponse
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
    user: User!
  }
`;

module.exports = typeDefs;
