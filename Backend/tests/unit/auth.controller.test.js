const authController = require("../../src/controllers/auth.controller")
const userModel = require("../../src/models/user.model")
const tokenBlacklistModel = require("../../src/models/blacklist.model")

jest.mock("../../src/models/user.model")
jest.mock("../../src/models/blacklist.model")

describe("Auth Controller Unit Tests", () => {
    let req, res

    beforeEach(() => {
        jest.clearAllMocks()
        req = {
            body: {},
            cookies: {},
            user: {}
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis()
        }
    })

    test("registerUserController returns 400 if required fields are missing", async () => {
        req.body = { email: "test@example.com" } // missing username & password

        await authController.registerUserController(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Please provide username, email and password"
        }))
    })

    test("loginUserController returns 400 if user does not exist", async () => {
        req.body = { email: "nonexistent_user@example.com", password: "Password123" }
        userModel.findOne.mockResolvedValue(null)

        await authController.loginUserController(req, res)

        expect(userModel.findOne).toHaveBeenCalledWith({ email: "nonexistent_user@example.com" })
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Invalid email or password"
        }))
    })

    test("logoutUserController clears cookie and adds token to blacklist", async () => {
        req.cookies = { token: "sample_token_123" }
        tokenBlacklistModel.create.mockResolvedValue({ token: "sample_token_123" })

        await authController.logoutUserController(req, res)

        expect(tokenBlacklistModel.create).toHaveBeenCalledWith({ token: "sample_token_123" })
        expect(res.clearCookie).toHaveBeenCalledWith("token")
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "User logged out successfully"
        }))
    })
})
