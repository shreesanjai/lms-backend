const cron = require("node-cron");
const { CRON_INTERVAL } = require("../utils/constants");
const { getPolicyByInterval } = require("../model/PolicyModel");
const { updateLeaveAvailability } = require("../model/LeaveModel");

const quarterlyScheduleTask = async () => {

    try {

        const policies = await getPolicyByInterval([CRON_INTERVAL.PER_QUARTER]);

        policies.forEach(async (element) => {
            console.log(element);
            const resp = await updateLeaveAvailability(element);
            if (resp)
                console.log(element.leavename + " Update Success")
            else
                console.log(element.leavename + " Error");

        });

    } catch (error) {
        console.error("Quarterly CRON Error : " + error);

    }

}

// At 00:00 on day-of-month 1 in January, April, July, and October.

cron.schedule("0 0 1 4,7,10 *", quarterlyScheduleTask) 
