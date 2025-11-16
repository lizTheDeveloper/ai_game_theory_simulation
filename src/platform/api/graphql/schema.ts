/**
 * GraphQL Schema
 *
 * Type definitions for Citation Integrity Platform GraphQL API
 */

export const typeDefs = `#graphql
  # Scalars
  scalar DateTime
  scalar JSON

  # Enums
  enum ProvenanceType {
    PLACEHOLDER
    INFORMED
    VERIFIED
  }

  enum SeverityLevel {
    VERIFIED
    MAGNITUDE_ERROR
    SCOPE_INFLATION
    FABRICATION
  }

  enum LssLevel {
    parameter
    claim
    memory
    verification
  }

  enum LssSeverity {
    INFO
    WARNING
    CRITICAL
  }

  enum UserRole {
    admin
    researcher
    read_only
  }

  enum SensitivityLevel {
    LOW
    MEDIUM
    HIGH
  }

  # Types
  type Provenance {
    type: ProvenanceType!
    source: String
    doi: String
    confidence: Float!
    lss: Float!
    sensitivity: SensitivityLevel
  }

  type Parameter {
    id: ID!
    name: String!
    value: Float!
    provenance: Provenance!
    createdAt: DateTime!
    updatedAt: DateTime!
    history: [ParameterHistory!]!
  }

  type ParameterHistory {
    timestamp: DateTime!
    value: Float!
    type: ProvenanceType!
    changedBy: String
  }

  type Claim {
    id: ID!
    text: String!
    sourceRef: String!
    extractedValue: String
    file: String
    line: Int
    timestamp: DateTime!
  }

  type ClaimVerificationResult {
    id: ID!
    verified: Boolean!
    confidence: Float!
    sourceMatch: String
    lss: Float!
    severity: SeverityLevel!
    penalty: Float!
  }

  type GradingResult {
    studentId: String!
    assignmentId: String!
    totalClaims: Int!
    verifiedClaims: Int!
    errors: ErrorBreakdown!
    score: Float!
    maxScore: Float!
    grade: String!
    feedback: [String!]!
    details: [ClaimVerificationResult!]!
  }

  type ErrorBreakdown {
    magnitude: Int!
    scope: Int!
    fabrication: Int!
  }

  type LssEvent {
    id: ID!
    level: LssLevel!
    lss: Float!
    threshold: Float!
    context: String!
    details: JSON!
    timestamp: DateTime!
    severity: LssSeverity!
  }

  type LssStats {
    totalEvents: Int!
    byLevel: LssLevelStats!
    bySeverity: LssSeverityStats!
    avgLss: AvgLssStats!
  }

  type LssLevelStats {
    parameter: Int!
    claim: Int!
    memory: Int!
    verification: Int!
  }

  type LssSeverityStats {
    INFO: Int!
    WARNING: Int!
    CRITICAL: Int!
  }

  type AvgLssStats {
    parameter: Float!
    claim: Float!
    memory: Float!
    verification: Float!
  }

  # Inputs
  input ProvenanceValidationInput {
    name: String!
    value: Float!
    type: ProvenanceType
    source: String
    doi: String
  }

  input ClaimExtractionInput {
    content: String!
    format: String
  }

  input ClaimVerificationInput {
    claims: [ClaimInput!]!
    timeout: Int
  }

  input ClaimInput {
    id: String!
    text: String!
    sourceRef: String!
    extractedValue: String
  }

  input GradingInput {
    studentId: String!
    assignmentId: String!
    claims: [ClaimInput!]!
    rubric: RubricInput
  }

  input RubricInput {
    maxPoints: Float!
    severityWeights: SeverityWeightsInput!
  }

  input SeverityWeightsInput {
    VERIFIED: Float!
    MAGNITUDE_ERROR: Float!
    SCOPE_INFLATION: Float!
    FABRICATION: Float!
  }

  input LssEventsInput {
    level: LssLevel
    threshold: Float
    since: DateTime
    limit: Int
  }

  # Queries
  type Query {
    # Parameters
    parameter(name: String!): Parameter
    parameters(type: ProvenanceType, page: Int, pageSize: Int): [Parameter!]!

    # Claims
    claim(id: ID!): Claim

    # LSS Monitoring
    lssEvents(input: LssEventsInput): [LssEvent!]!
    lssStats: LssStats!

    # Grading
    studentGrades(studentId: String!): [GradingResult!]!
    assignmentGrades(assignmentId: String!): [GradingResult!]!
  }

  # Mutations
  type Mutation {
    # Provenance
    validateProvenance(input: ProvenanceValidationInput!): Parameter!
    updateProvenance(name: String!, input: ProvenanceValidationInput!): Parameter!

    # Verification
    extractClaims(input: ClaimExtractionInput!): [Claim!]!
    verifyClaims(input: ClaimVerificationInput!): [ClaimVerificationResult!]!

    # Grading
    calculateGrade(input: GradingInput!): GradingResult!

    # LSS
    createLssAlert(event: JSON!): LssEvent!
  }

  # Subscriptions (Real-time updates)
  type Subscription {
    # Subscribe to LSS events above threshold
    lssEventCreated(threshold: Float): LssEvent!

    # Subscribe to parameter changes
    parameterUpdated(name: String): Parameter!

    # Subscribe to verification results
    claimVerified: ClaimVerificationResult!
  }
`;
