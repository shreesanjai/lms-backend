const cron = require("node-cron")
const { getPolicyByInterval } = require("../model/PolicyModel")
const { CRON_INTERVAL } = require("../utils/constants")
const { updateLeaveAvailability } = require("../model/LeaveModel")

const monthlyScheduleTask = async () => {

    try {

        const policies = await getPolicyByInterval([CRON_INTERVAL.PER_MONTH])

        policies.forEach(async (element) => {
            console.log(element);
            const resp = await updateLeaveAvailability(element);
            if (resp)
                console.log(element.leavename + " Update Success")
            else
                console.log(element.leavenaem + " Error");

        });


    } catch (error) {
        console.error("Monthly CRON Error : " + error);

    }

}

// At 00:00 on day-of-month 1 in every month from February through December.


cron.schedule("0 0 1 2-12 * ", monthlyScheduleTask)

