
const pdfParse = require("pdf-parse")

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service")

const interviewReportModel =
    require("../models/interviewReport.model")


async function generateInterViewReportController(req, res) {

    try {

        console.log("========== INTERVIEW REQUEST ==========")
        console.log("BODY:", req.body)
        console.log("FILE:", req.file ? req.file.originalname : "NO FILE")
        console.log("=======================================")


        if (!req.file) {
            return res.status(400).json({
                message: "Resume PDF is required."
            })
        }


        const {
            selfDescription,
            jobDescription,
            jobTitle
        } = req.body


        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({
                message: "Job title is required."
            })
        }


        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }


        const resumeContent =
            await (
                new pdfParse.PDFParse(
                    Uint8Array.from(
                        req.file.buffer
                    )
                )
            ).getText()


        if (
            !resumeContent ||
            !resumeContent.text ||
            !resumeContent.text.trim()
        ) {
            return res.status(400).json({
                message:
                    "Could not extract text from the uploaded resume."
            })
        }


        const cleanJobTitle =
            jobTitle.trim()


        const cleanJobDescription =
            jobDescription.trim()


        const cleanSelfDescription =
            selfDescription
                ? selfDescription.trim()
                : ""


        console.log(
            "Job Title:",
            cleanJobTitle
        )


        console.log(
            "Generating interview report..."
        )


        const interviewReportByAi =
            await generateInterviewReport({

                resume:
                    resumeContent.text,

                selfDescription:
                    cleanSelfDescription,

                jobDescription:
                    cleanJobDescription,

                jobTitle:
                    cleanJobTitle
            })


        console.log(
            "AI Report Generated"
        )


        const interviewReport =
            await interviewReportModel.create({

                user:
                    req.user.id,

                resume:
                    resumeContent.text,

                selfDescription:
                    cleanSelfDescription,

                jobDescription:
                    cleanJobDescription,

                ...interviewReportByAi,

                title:
                    cleanJobTitle
            })


        console.log(
            "Interview report saved successfully."
        )


        return res.status(201).json({

            message:
                "Interview report generated successfully.",

            interviewReport
        })

    } catch (error) {

        console.error(
            "Generate Interview Report Error:"
        )

        console.error(error)


        return res.status(500).json({

            message:
                error.message ||
                "Failed to generate interview report."
        })
    }
}


async function getInterviewReportByIdController(
    req,
    res
) {

    try {

        const {
            interviewId
        } = req.params


        const interviewReport =
            await interviewReportModel.findOne({

                _id:
                    interviewId,

                user:
                    req.user.id
            })


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found."
            })
        }


        return res.status(200).json({

            message:
                "Interview report fetched successfully.",

            interviewReport
        })

    } catch (error) {

        console.error(
            "Get Interview Report Error:"
        )

        console.error(error)


        return res.status(500).json({

            message:
                error.message ||
                "Failed to fetch interview report."
        })
    }
}


async function getAllInterviewReportsController(
    req,
    res
) {

    try {

        const interviewReports =
            await interviewReportModel
                .find({
                    user:
                        req.user.id
                })
                .sort({
                    createdAt: -1
                })
                .select(
                    "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
                )


        return res.status(200).json({

            message:
                "Interview reports fetched successfully.",

            interviewReports
        })

    } catch (error) {

        console.error(
            "Get All Interview Reports Error:"
        )

        console.error(error)


        return res.status(500).json({

            message:
                error.message ||
                "Failed to fetch interview reports."
        })
    }
}


async function generateResumePdfController(
    req,
    res
) {

    try {

        const {
            interviewReportId
        } = req.params


        const interviewReport =
            await interviewReportModel.findOne({

                _id:
                    interviewReportId,

                user:
                    req.user.id
            })


        if (!interviewReport) {

            return res.status(404).json({

                message:
                    "Interview report not found."
            })
        }


        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport


        const pdfBuffer =
            await generateResumePdf({

                resume,

                jobDescription,

                selfDescription
            })


        res.set({

            "Content-Type":
                "application/pdf",

            "Content-Disposition":
                `attachment; filename = resume_${ interviewReportId }.pdf`
        })


        return res.send(pdfBuffer)

    } catch (error) {

        console.error(
            "Generate Resume PDF Error:"
        )

        console.error(error)


        return res.status(500).json({

            message:
                error.message ||
                "Failed to generate resume PDF."
        })
    }
}


module.exports = {

    generateInterViewReportController,

    getInterviewReportByIdController,

    getAllInterviewReportsController,

    generateResumePdfController
}

