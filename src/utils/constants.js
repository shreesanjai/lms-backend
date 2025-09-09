const ROLES = {
  TRAINEE: 'Trainee',
  DEVELOPER: 'Developer',
  HR: 'HR',
  ADMIN: 'Admin'
};

const LEAVE_STATUS = {
  "PENDING": 'pending',
  "APPROVED": 'approved',
  "REJECTED": 'rejected',
  "CANCELLED": 'cancelled',
  "PARTIAL_APPROVE": "partially_approved"
};

const CRON_INTERVAL = {
  "PER_MONTH": "MONTHLY",
  "PER_QUARTER": "QUARTERLY",
  "PER_YEAR": "ANNUALLY",

}

module.exports = { ROLES, LEAVE_STATUS, CRON_INTERVAL }