const { generateInterviewReport, generateResumePdf } = require("../../src/services/ai.service")

describe("AI Service Unit Tests", () => {
    test("generateInterviewReport returns structured data with title, matchScore, questions and prep plan", async () => {
        const result = await generateInterviewReport({
            resume: "Experienced React and TypeScript engineer with Node.js backend experience.",
            selfDescription: "Frontend developer specializing in modern web applications.",
            jobDescription: "Senior Frontend Engineer at Google requiring React, TypeScript, and performance optimization."
        })

        expect(result).toBeDefined()
        expect(result.title).toBeDefined()
        expect(typeof result.title).toBe("string")
        expect(result.matchScore).toBeGreaterThanOrEqual(0)
        expect(result.matchScore).toBeLessThanOrEqual(100)
        expect(Array.isArray(result.technicalQuestions)).toBe(true)
        expect(result.technicalQuestions.length).toBeGreaterThan(0)
        expect(Array.isArray(result.behavioralQuestions)).toBe(true)
        expect(Array.isArray(result.skillGaps)).toBe(true)
        expect(Array.isArray(result.preparationPlan)).toBe(true)
    }, 15000)

    test("generateInterviewReport dynamically customizes technical questions for Python / Backend role", async () => {
        const pythonResult = await generateInterviewReport({
            resume: "Python Django developer with PostgreSQL and Docker experience",
            selfDescription: "Backend specialist",
            jobDescription: "Lead Python Developer with Django and Kubernetes expertise"
        })

        expect(pythonResult.title).toContain("Python")
        const questionText = JSON.stringify(pythonResult.technicalQuestions)
        expect(questionText.toLowerCase()).toContain("python")
    }, 15000)

    test("generateResumePdf generates a non-empty PDF buffer", async () => {
        const pdfBuffer = await generateResumePdf({
            resume: "Full Stack Engineer specializing in Node.js, React, and MongoDB",
            selfDescription: "Software Developer",
            jobDescription: "Full Stack Developer role"
        })

        expect(pdfBuffer).toBeDefined()
        expect(Buffer.isBuffer(pdfBuffer) || pdfBuffer instanceof Uint8Array).toBe(true)
        expect(pdfBuffer.length).toBeGreaterThan(1000) // Valid PDF file size
    }, 30000)
})
