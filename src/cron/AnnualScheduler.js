const cron = require("node-cron");
const { CRON_INTERVAL } = require("../utils/constants");
const { getPolicyByInterval } = require("../model/PolicyModel");
const { updateLeaveAvailability, updateLeaveAvailabilityYear } = require("../model/LeaveModel");

const annuallyScheduleTask = async () => {

    try {

        console.log(Object.entries(CRON_INTERVAL).map(item => item[1]));

        const policies = await getPolicyByInterval(Object.entries(CRON_INTERVAL).map(item => item[1]))

        console.log(policies);


        policies.forEach(async (element) => {
            console.log(element);
            const resp = await updateLeaveAvailabilityYear(element);
            if (resp)
                console.log(element.leavename + " Update Success")
            else
                console.log(element.leavename + " Error");

        });



    } catch (error) {
        console.error("Yearly CRON Error : " + error);
    }
}


//At 00:00 in January.
cron.schedule("0 0 * 1 * ", annuallyScheduleTask)
