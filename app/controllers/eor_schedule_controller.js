const { EORSchedule, EOR, EORScheduleReview } = require('../models'); // pastikan path models sesuai

exports.createEORSchedule = async (req, res) => {
    try {
        const {
            eor_id,
            schedule_on_evaluation_work_plan_start,
            schedule_on_evaluation_work_plan_end,
            execution_time_on_workbook_start,
            execution_time_on_workbook_end
        } = req.body;

        const EORFound = await EOR.findByPk(eor_id);
        if (!EORFound) {
            return res.status(404).json({ status: false, message: 'EOR not found' });
        }

        const EORScheduleFound = await EORSchedule.findOne({
            where: { eor_id }
        });
        if (EORScheduleFound) {
            return res.status(400).json({ status: false, message: 'EOR Schedule for this EOR already exists' });
        }

        const newEORSchedule = await EORSchedule.create({
            schedule_on_evaluation_work_plan_start,
            schedule_on_evaluation_work_plan_end,
            execution_time_on_workbook_start,
            execution_time_on_workbook_end,
            eor_id
        });

        res.status(201).json({
            status: true,
            message: 'EOR Schedule created successfully',
            data: newEORSchedule
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error creating EOR Schedule' });
    }
};

exports.getAllEORSchedule = async (req, res) => {
    try {
        const EORSchedulesFound = await EORSchedule.findAll({
            include: [
                {
                    model: EORScheduleReview
                }
            ]
        });
        res.status(200).json({
            status: true,
            message: 'EOR Schedules retrieved successfully',
            data: EORSchedulesFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Schedule', });
    }
};

exports.getEORScheduleById = async (req, res) => {
    try {
        const id = req.params.id;
        const EORScheduleFound = await EORSchedule.findByPk(id);

        if (!EORScheduleFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule not found' });
        }

        res.status(200).json({
            status: true,
            message: 'EOR Schedule retrieved successfully',
            data: EORScheduleFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Schedule' });
    }
};

exports.getEORScheduleByEORId = async (req, res) => {
    try {
        const eor_id = req.params.id;
        const EORScheduleFound = await EORSchedule.findOne({
            where: {
                eor_id: eor_id
            },
            include: [
                {
                    model: EORScheduleReview
                }
            ]
        });

        res.status(200).json({
            status: true,
            message: 'EOR Schedule of EOR retrieved successfully',
            data: EORScheduleFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error fetching EOR Schedule' });
    }
};

exports.updateEORSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            schedule_on_evaluation_work_plan_start,
            schedule_on_evaluation_work_plan_end,
            execution_time_on_workbook_start,
            execution_time_on_workbook_end
        } = req.body;

        const EORScheduleFound = await EORSchedule.findByPk(id);
        if (!EORScheduleFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule not found' });
        }

        EORScheduleFound.schedule_on_evaluation_work_plan_start = schedule_on_evaluation_work_plan_start;
        EORScheduleFound.schedule_on_evaluation_work_plan_end = schedule_on_evaluation_work_plan_end;
        EORScheduleFound.execution_time_on_workbook_start = execution_time_on_workbook_start;
        EORScheduleFound.execution_time_on_workbook_end = execution_time_on_workbook_end;
        await EORScheduleFound.save();

        res.status(200).json({
            status: true,
            message: 'EOR Schedule updated successfully',
            data: EORScheduleFound
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error updating EOR Schedule' });
    }
};

exports.deleteEORSchedule = async (req, res) => {
    try {
        const id = req.params.id;

        const EORScheduleFound = await EORSchedule.findByPk(id);
        if (!EORScheduleFound) {
            return res.status(404).json({ status: false, message: 'EOR Schedule not found' });
        }

        await EORScheduleFound.destroy();

        res.status(200).json({
            status: true,
            message: 'EOR Schedule deleted successfully'
        });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Error deleting EOR Schedule' });
    }
};
