const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    user: User!
    publicUser(arId: String!): PublicUser
    publicUsers(arIds: [String!]!): [PublicUser]!
    allUsers(
      limit: Int
      page: Int
      sortBy: String
      sortDir: Int
      filterBy: String
      pattern: String
    ): UserQueryRes
    allTeams(
      limit: Int
      page: Int
      sortBy: String
      sortDir: Int
      filterBy: String
      pattern: String
    ): TeamQueryRes
    eventTeams(
      eventId: Int
      limit: Int
      page: Int
      sortBy: String
      sortDir: Int
      filterBy: String
      pattern: String
      paymentStatus: Boolean
    ): TeamQueryRes
    eventOrders(
      limit: Int
      page: Int
      sortBy: String
      sortDir: Int
      filterBy: String
      pattern: String
      status: String
    ): EventOrderRes
    proniteOrders(
      limit: Int
      page: Int
      sortBy: String
      sortDir: Int
      filterBy: String
      pattern: String
      status: String
    ): OrderRes
    accOrders(
      limit: Int
      page: Int
      sortBy: String
      sortDir: Int
      filterBy: String
      pattern: String
      status: String
    ): OrderRes
    adminMetadata: AdminRes
  }

  type UserQueryRes {
    total: Int!
    users: [User!]
  }

  type TeamQueryRes {
    total: Int!
    teams: [PrivateTeam!]
  }

  type EventOrderRes {
    total: Int!
    orders: [EvtOrder!]
  }
  type OrderRes {
    total: Int!
    orders: [Order!]
  }

  type AdminRes {
    roles: [String!]
    canViewUsers: Boolean
    canEditUsers: Boolean
    canViewEvents: Boolean
    canViewOrders: Boolean
    canEditOrders: Boolean
    canViewAcc: Boolean
    canEditAcc: Boolean
    canViewPronites: Boolean
    canEditPronites: Boolean
    canViewCA: Boolean
    canEditCA: Boolean
    events: [Event!]
  }

  type EvtOrder {
    orderId: String!
    paymentId: String
    receipt: String!
    paidBy: User!
    teams: [NullTeam!]
    amount: Int!
    finalAmount: Int!
    status: String!
    timeSt: Int!
  }

  type Order {
    orderId: String!
    paymentId: String
    receipt: String!
    paidBy: User!
    users: [User!]
    amount: Int!
    finalAmount: Int!
    status: String!
    timeSt: Int!
  }

  type Event {
    id: Int!
    name: String!
    maxSize: Int!
    isNameRequired: Boolean!
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
    pronite: Boolean!
    teams: [Team!]
    teamInvitations: [TeamInvitation!]
    timeSt: String!
    ca: CA!
  }

  type CA {
    isCA: Boolean!
    caId: String
    users: [User!]
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
  type NullTeam {
    id: String!
    name: String
    event: Event
    members: [PublicUser]
    paymentStatus: Boolean
    pendingInvitations: [PublicUser]
  }

  type PrivateTeam {
    id: String!
    name: String
    event: Event!
    members: [User!]!
    paymentStatus: Boolean!
    pendingInvitations: [User!]
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
    alphaSignup(
      email: String!
      name: String!
      college: String!
      gender: String!
      city: String!
      phone: String!
      passcode: String!
    ): String!
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
    setTeamName(teamId: String!, name: String!): EventResponse
    generateEventOrder(teamIds: [String!]!): OrderResponse
    verifyEventOrder(orderId: String!, paymentId: String!, signature: String!): UserResponse
    generateAccOrder(userIds: [String!]!): OrderResponse
    verifyAccOrder(orderId: String!, paymentId: String!, signature: String!): UserResponse
    generateProniteOrder(userIds: [String!]!): OrderResponse
    verifyProniteOrder(orderId: String!, paymentId: String!, signature: String!): UserResponse
    makeEventAdmin(arId: String!, eventIds: [Int!]!): MutationResponse
    makeCA(arId: String!): MutationResponse
    impersonate(arId: String!): String!
    reVerifyEvtOrder(orderId: String!): MutationResponse
    reVerifyAccOrder(orderId: String!): MutationResponse
    reVerifyProniteOrder(orderId: String!): MutationResponse
    updateProfile(name: String!, college: String!, city: String!, phone: String!): UserResponse
    uploadPhoto(photo: Upload!): UserResponse
    setCA(id: String!): UserResponse
  }

  type EventResponse {
    code: String!
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

  type OrderResponse {
    order_id: String!
    key: String!
    amount: String!
  }
`;

module.exports = typeDefs;
