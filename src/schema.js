const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    events(userId: ID!): [Event!]
    user(email: String!): User
  }

  type Event {
    id: ID
    name: String
    maxSize: Int
    fee: Int
  }

  type User {
    id: ID
    name: String
    college: String
    phone: String
    isVerified: Boolean
    Accommodation: Boolean
    teams: [Team!]
  }

  type Team {
    id: ID
    name: String
    event: Event
    members: [Users!]!
    paymentStatus: Boolean
  }

  type Mutation {
    login(email: String!, password: String!): String
    signup(email: String!, password: String!, name: String!, college: String!, phone: String!): MutationResponse
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