

const { pool } = require("../config/db.js");


const createLeaveRequest = async (request) => {

    const result = await pool.query(`
            INSERT INTO leave_request (employee_id, startdate, enddate, status, no_of_days, notes, policy_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
            `, [request.employee_id, request.startDate, request.endDate, "pending", request.no_of_days, request.notes, request.policy_id])

    return result.rows[0]

}

const getLeaveRequestById = async (id) => {
    const res = await pool.query(`SELECT * FROM leave_request WHERE id = $1`, [id])
    return res.rows[0];
}

const getPendingLeaveRequestByUserId = async (id) => {

    const res = await pool.query(` 
    SELECT 
            l.*,
            to_char(l.startdate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS startdate,
            to_char(l.enddate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS enddate,
            e.name AS employee_name,
            e.username AS employee_username,
            m.name AS manager_name,
            m.username AS manager_username,
            hr.name AS hr_name,
            p.leavename AS leave_type
        FROM leave_request l
        JOIN employee e ON e.id = l.employee_id
        LEFT JOIN employee m ON m.id = e.reporting_manager_id
        LEFT JOIN employee hr ON hr.id = e.hr_id
        LEFT JOIN policy p ON l.policy_id = p.id
        WHERE 
            l.employee_id = $1
        AND 
            l.status != 'approved';
    `, [id])
    return res.rows
}

const myUserPendingRequests = async (id) => {
    const res = await pool.query(`
       SELECT 
            lr.*,
            to_char(lr.startdate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS startdate,
            to_char(lr.enddate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS enddate,
            p.leavename,
            e.name,
            e.username
        FROM 
            leave_request lr
        LEFT JOIN 
            policy p ON lr.policy_id = p.id
        LEFT JOIN 
            employee e ON lr.employee_id = e.id
        WHERE 
            e.reporting_manager_id = $1 
        AND 
            lr.status = 'pending'
        ORDER BY lr.startdate ASC;
        `, [id])
    return res.rows
}

const myPeoplePendingRequests = async (id) => {
    const res = await pool.query(`
       SELECT 
            lr.*,
            to_char(lr.startdate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS startdate,
            to_char(lr.enddate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS enddate,
            p.leavename,
            e.name,
            e.username
        FROM 
            leave_request lr
        LEFT JOIN 
            policy p ON lr.policy_id = p.id
        JOIN 
            employee e ON lr.employee_id = e.id
        WHERE 
            e.hr_id = $1 
        AND 
            lr.status = 'partially_approved'
        `, [id])
    return res.rows
}

const statusUpdate = async (id, status, data) => {
    const res = await pool.query(`
        UPDATE 
            leave_request
        SET 
            status = $2,
            reject_cancel_reason = $3,
            statusupdate_at = NOW()
        WHERE
            id = $1 
        RETURNING *
            `, [id, status, data])
    return res.rows[0]
}

const getLeaveRequestByEmployeeId = async (employee_id, year) => {
    const resp = await pool.query(`
        SELECT 
            lr.*,
            to_char(lr.startdate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS startdate,
            to_char(lr.enddate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS enddate,
            p.leavename,
            e.name,
            m.name as approver,
            hr.name as hr
        FROM 
            leave_request lr
        LEFT JOIN 
            policy p ON lr.policy_id = p.id
        LEFT JOIN
            employee e ON e.id = lr.employee_id
        LEFT JOIN 
            employee m ON e.reporting_manager_id = m.id
        LEFT JOIN 
            employee hr ON e.hr_id = hr.id
        WHERE 
            lr.employee_id = $1 
            AND EXTRACT(YEAR FROM lr.startdate) = $2
        ORDER BY lr.startdate DESC;
        `, [employee_id, year])

    return resp.rows
}

const getSummaryData = async (employee_id, year) => {
    const query = `
    SELECT 
        la.policy_id,
        COALESCE(SUM(CASE WHEN lr.status = 'approved' THEN lr.no_of_days END), 0) AS consumed,
        la.availability AS available,
        la.total_allocted AS annual_quota,
        p.leavename
    FROM leave_availability la
    LEFT JOIN policy p 
        ON la.policy_id = p.id
    LEFT JOIN leave_request lr 
        ON la.policy_id = lr.policy_id
       AND la.employee_id = lr.employee_id
       AND lr.status = 'approved'
       AND EXTRACT(YEAR FROM lr.startdate) = $2
    WHERE la.employee_id = $1
    GROUP BY la.policy_id, la.availability, la.total_allocted, p.leavename;
  `;

    const resp = await pool.query(query, [employee_id, year]);
    return resp.rows;
};

const getMonthlyLeaveStats = async (employee_id, year) => {
    const query = `
    WITH employee_leaves AS (
        SELECT 
            lr.startdate,
            lr.enddate,
            lr.no_of_days
        FROM leave_request lr
        WHERE lr.employee_id = $1
          AND lr.status = 'approved'
          AND EXTRACT(YEAR FROM lr.startdate) = $2
    ),
    leave_date_series AS (
        SELECT 
            el.startdate,
            el.enddate,
            generate_series(el.startdate, el.enddate, '1 day'::interval)::date AS leave_date
        FROM employee_leaves el
    ),
    monthly_leave_days AS (
        SELECT 
            EXTRACT(MONTH FROM lds.leave_date)::INT AS month,
            COUNT(*) AS leave_consumed
        FROM leave_date_series lds
        WHERE EXTRACT(DOW FROM lds.leave_date) BETWEEN 1 AND 5  -- Only count weekdays (Mon-Fri)
        GROUP BY EXTRACT(MONTH FROM lds.leave_date)
    ),
    monthly_floater_holidays AS (
        SELECT 
            EXTRACT(MONTH FROM h.date)::INT AS month,
            COUNT(*) AS floater_holiday_count
        FROM holiday h
        WHERE EXTRACT(YEAR FROM h.date) = $2
          AND EXTRACT(DOW FROM h.date) BETWEEN 1 AND 5  -- Monday to Friday only
          AND h.is_floater = true
          AND EXISTS (
              SELECT 1 
              FROM employee_leaves el
              WHERE h.date BETWEEN el.startdate AND el.enddate
          )
        GROUP BY EXTRACT(MONTH FROM h.date)
    ),
    all_months AS (
        SELECT generate_series(1, 12) AS month
    )
    SELECT 
        am.month,
        COALESCE(mld.leave_consumed, 0) + COALESCE(mfh.floater_holiday_count, 0) AS consumed
    FROM all_months am
    LEFT JOIN monthly_leave_days mld ON am.month = mld.month
    LEFT JOIN monthly_floater_holidays mfh ON am.month = mfh.month
    ORDER BY am.month;
    `;
    const resp = await pool.query(query, [employee_id, year]);
    return resp.rows;
};

const getWeeklyLeaveStats = async (employee_id, year) => {
    const query = `
    WITH employee_leaves AS (
        SELECT 
            lr.startdate,
            lr.enddate,
            lr.no_of_days
        FROM leave_request lr
        WHERE lr.employee_id = $1
          AND lr.status = 'approved'
          AND EXTRACT(YEAR FROM lr.startdate) = $2
    ),
    leave_date_series AS (
        SELECT 
            el.startdate,
            el.enddate,
            generate_series(el.startdate, el.enddate, '1 day'::interval)::date AS leave_date
        FROM employee_leaves el
    ),
    weekday_leave_days AS (
        SELECT 
            EXTRACT(DOW FROM lds.leave_date)::INT AS week,
            COUNT(*) AS leave_consumed
        FROM leave_date_series lds
        WHERE EXTRACT(DOW FROM lds.leave_date) BETWEEN 1 AND 5  -- Only count weekdays (Mon-Fri)
        GROUP BY EXTRACT(DOW FROM lds.leave_date)
    ),
    weekday_floater_holidays AS (
        SELECT 
            EXTRACT(DOW FROM h.date)::INT AS week,
            COUNT(*) AS floater_holiday_count
        FROM holiday h
        WHERE EXTRACT(YEAR FROM h.date) = $2
          AND EXTRACT(DOW FROM h.date) BETWEEN 1 AND 5  -- Only weekdays
          AND h.is_floater = true
          AND EXISTS (
              SELECT 1 
              FROM employee_leaves el
              WHERE h.date BETWEEN el.startdate AND el.enddate
          )
        GROUP BY EXTRACT(DOW FROM h.date)
    ),
    all_weekdays AS (
        SELECT generate_series(0, 6) AS week
    )
    SELECT 
        aw.week,
        COALESCE(wld.leave_consumed, 0) + COALESCE(wfh.floater_holiday_count, 0) AS consumed
    FROM all_weekdays aw
    LEFT JOIN weekday_leave_days wld ON aw.week = wld.week
    LEFT JOIN weekday_floater_holidays wfh ON aw.week = wfh.week
    ORDER BY aw.week;
    `;
    const resp = await pool.query(query, [employee_id, year]);
    return resp.rows;
};

const getTeamLeaves = async (manager_id, year, month = null) => {

    console.log(manager_id, year, month);

    const params = [manager_id, year];
    let monthFilter = "";

    if (month !== null) {
        params.push(month);
        monthFilter = "AND EXTRACT(MONTH FROM lr.startdate) = $3";
    }

    const query = `
    SELECT 
        lr.id AS leave_id,
        e.name AS employee_name,
        p.leavename,
        p.id as calendarDayStatus,
        to_char(lr.startdate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS startdate,
        to_char(lr.enddate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS enddate,
        lr.no_of_days
    FROM leave_request lr
    LEFT JOIN employee e 
        ON lr.employee_id = e.id
    LEFT JOIN policy p 
        ON lr.policy_id = p.id
    WHERE e.reporting_manager_id = $1 OR e.id = $1
      AND lr.status = 'approved'
      AND EXTRACT(YEAR FROM lr.startdate) = $2
      ${monthFilter}
    ORDER BY lr.startdate;
  `;

    const resp = await pool.query(query, params);
    return resp.rows;
};

const getPeopleLeaves = async (manager_id, year, month = null) => {
    const params = [manager_id, year];
    let monthFilter = "";

    if (month !== null) {
        params.push(month);
        monthFilter = "AND EXTRACT(MONTH FROM lr.startdate) = $3";
    }

    const query = `
    SELECT 
        lr.id AS leave_id,
        e.name AS employee_name,
        p.leavename,
        p.id as calendarDayStatus,
        to_char(lr.startdate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS startdate,
        to_char(lr.enddate::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS enddate,
        lr.no_of_days
    FROM leave_request lr
    JOIN employee e 
        ON lr.employee_id = e.id
    JOIN policy p 
        ON lr.policy_id = p.id
    WHERE e.hr_id = $1
      AND lr.status = 'approved'
      AND EXTRACT(YEAR FROM lr.startdate) = $2
      ${monthFilter}
    ORDER BY lr.startdate;
  `;

    const resp = await pool.query(query, params);
    return resp.rows;
};



const leaveAvailabilityUpdate = async (employee_id, policy_id, availability) => {
    const res = await pool.query(`
        UPDATE 
            leave_availability
        SET 
            availability = $3
        WHERE 
            employee_id = $1 
        AND
            policy_id = $2
        RETURNING *
    `, [employee_id, policy_id, availability])
    return res.rows[0]
}

const getAvailability = async (employee_id, policy_id) => {
    const resp = await pool.query(`
        SELECT availability from leave_availability 
        WHERE 
        employee_id = $1 AND policy_id = $2
        `, [employee_id, policy_id])

    return resp.rows[0]
}

const updateLeaveAvailability = async (policy) => {

    const placeHolder = yearUpdate ? "$3" : "COALESCE(total_allocted, 0)"

    const resp = await pool.query(` 
        UPDATE public.leave_availability 
        SET 
            availability = CASE 
                WHEN $2 = true THEN                                   -- rollover is true
                    CASE 
                        WHEN COALESCE(availability, 0) <= $3 THEN     -- current availability <= rolloverlimit
                            COALESCE(availability, 0) + $4            -- current availability + accural_quantity
                        ELSE 
                            $3 + $4                                   -- rolloverlimit + accural_quantity
                    END
                ELSE 
                    $4                                                -- rollover is false, set to accural_quantity only
            END,
            total_allocted = ${placeHolder} + $4         -- always add accural_quantity to total_allocated
        WHERE policy_id = $1
        RETURNING employee_id, policy_id, availability, total_allocted;
        `, [policy.id, policy.rollover, policy.rolloverlimit, policy.accural_quantity])

    return resp.rows

}
const updateLeaveAvailabilityYear = async (policy) => {


    const resp = await pool.query(` 
        UPDATE public.leave_availability 
        SET 
            availability = CASE 
                WHEN $2 = true THEN                                   -- rollover is true
                    CASE 
                        WHEN COALESCE(availability, 0) <= $3 THEN     -- current availability <= rolloverlimit
                            COALESCE(availability, 0) + $4            -- current availability + accural_quantity
                        ELSE 
                            $3 + $4                                   -- rolloverlimit + accural_quantity
                    END
                ELSE 
                    $4                                                -- rollover is false, set to accural_quantity only
            END,
            total_allocted = CASE 
                WHEN $2 = true THEN                                   -- rollover is true
                    CASE 
                        WHEN COALESCE(availability, 0) <= $3 THEN     -- current availability <= rolloverlimit
                            COALESCE(availability, 0) + $4            -- current availability + accural_quantity
                        ELSE 
                            $3 + $4                                   -- rolloverlimit + accural_quantity
                    END
                ELSE 
                    $4                                                -- rollover is false, set to accural_quantity only
            END        -- always add accural_quantity to total_allocated
        WHERE policy_id = $1
        RETURNING employee_id, policy_id, availability, total_allocted;
        `, [policy.id, policy.rollover, policy.rolloverlimit, policy.accural_quantity])

    return resp.rows

}


module.exports = {
    getPendingLeaveRequestByUserId,
    createLeaveRequest,
    myUserPendingRequests,
    statusUpdate,
    leaveAvailabilityUpdate,
    getAvailability,
    getLeaveRequestByEmployeeId,
    getSummaryData,
    getMonthlyLeaveStats,
    getWeeklyLeaveStats,
    getTeamLeaves,
    getLeaveRequestById,
    myPeoplePendingRequests,
    getPeopleLeaves,
    updateLeaveAvailability,
    updateLeaveAvailabilityYear
};