const interviewController = require("../../src/controllers/interview.controller")
const interviewReportModel = require("../../src/models/interviewReport.model")

jest.mock("../../src/models/interviewReport.model")

describe("Interview Controller Unit Tests", () => {
    let req, res

    beforeEach(() => {
        jest.clearAllMocks()
        req = {
            body: {},
            params: {},
            user: { id: "user_12345" },
            file: null
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        }
    })

    test("generateInterViewReportController returns 400 if jobDescription is missing", async () => {
        req.body = { selfDescription: "React Developer" }

        await interviewController.generateInterViewReportController(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Job description is required."
        }))
    })

    test("generateInterViewReportController returns 400 if both resume and selfDescription are missing", async () => {
        req.body = { jobDescription: "Senior Frontend Engineer" }

        await interviewController.generateInterViewReportController(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Either a resume file or self description is required."
        }))
    })

    test("getInterviewReportByIdController returns 404 if report is not found", async () => {
        req.params = { interviewId: "invalid_id_99" }
        interviewReportModel.findOne.mockResolvedValue(null)

        await interviewController.getInterviewReportByIdController(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Interview report not found."
        }))
    })

    test("getAllInterviewReportsController fetches reports for logged in user", async () => {
        const mockReports = [{ _id: "rep_1", title: "React Role", matchScore: 85 }]
        interviewReportModel.find.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockReports)
        })

        await interviewController.getAllInterviewReportsController(req, res)

        expect(interviewReportModel.find).toHaveBeenCalledWith({ user: "user_12345" })
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            interviewReports: mockReports
        }))
    })
})
