const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    events: [Event!]
    user: User!
  }
  type Event {
    id: ID!
    name: String!
    maxSize: Int!
    fee: Int!
  }
  type User {
    id: ID!
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
    id: ID!
    name: String!
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
    eventRegister(userId: ID!, eventId: ID!): MutationResponse
    sendInvite(teamId: ID!, email: String!): MutationResponse
    cancelInvite(teamId: ID!, email: String!): MutationResponse
    acceptInvite(teamId: ID!): MutationResponse
    declineInvite(teamId: ID!): MutationResponse
    pay(teamId: ID!): MutationResponse
  }
  type MutationResponse {
    code: String
    success: Boolean!
    message: String
    user: User
  }
`;

module.exports = typeDefs;
