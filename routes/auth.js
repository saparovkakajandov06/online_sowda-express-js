const express = require("express");

const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendgridMail = require("@sendgrid/mail");
const config = require("../config");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");
const ResetToken = require("../models/ResetToken");
const generate = require("./helpers");

const JWT_SECRET = config.JWT_SECRET;
sendgridMail.setApiKey(config.SENDGRID_API_KEY);

// @route POST /login
// @desc login user
// @access public
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	// Simple validation
	if (!email || !password) {
		return res.status(400).json({ msg: "Please enter all fields" });
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			throw Error("No user found!");
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			throw Error("Invalid password or email!");
		}

		// create/sign token
		const token = jwt.sign(
			{ id: user._id, isAdmin: user.isAdmin },
			JWT_SECRET,
			{ expiresIn: 3600 }
		);

		if (!token) {
			throw Error("Couldnt sign the token");
		}

		res.status(200).json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				password: user.password,
				city: user.city,
				street: user.street,
				phone: user.phone,
			},
		});
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
});

// @route POST /register
// @desc register user
// @access public
router.post("/register", async (req, res) => {
	const { email, password, name } = req.body;

	// Simple validation
	if (!email || !password || !name) {
		return res.status(400).json({ msg: "Please enter all fields" });
	}

	try {
		const user = await User.findOne({ email });

		if (user) {
			throw Error("User already exists!");
		}

		const salt = await bcrypt.genSalt(10);

		if (!salt) {
			throw Error("Something went wrong with bcrypt!");
		}

		const hash = await bcrypt.hash(password, salt);

		if (!hash) {
			throw Error("Something went wrong hashing the password");
		}

		const newUser = new User({
			name,
			email,
			password: hash,
		});

		const savedUser = await newUser.save();

		if (!savedUser) {
			throw Error("Something went wrong saving new user");
		}

		// create/sign token
		const token = jwt.sign(
			{ id: savedUser._id, isAdmin: savedUser.isAdmin },
			JWT_SECRET,
			{
				expiresIn: 3600,
			}
		);

		res.status(200).json({
			token,
			user: {
				id: savedUser._id,
				name: savedUser.name,
				email: savedUser.email,
			},
		});
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
});

// @route GET /:id
// @desc get user data
// @access private
router.get("/:id", authMiddleware, async (req, res) => {
	try {
		// get user data without password
		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			throw Error("No user found!");
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
});

// @route PATCH /:id
// @desc update user profile
// @access private
router.patch("/:id", authMiddleware, async (req, res) => {
	try {
		const newPassword = req.body.password;
		const salt = await bcrypt.genSalt(10);

		if (!salt) {
			throw Error("Something went wrong with bcrypt!");
		}

		const hashedPassword = await bcrypt.hash(newPassword, salt);

		if (!hashedPassword) {
			throw Error("Something went wrong hashing the password");
		}

		const newUser = {
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
			registerDate: req.body.registerDate,
			street: req.body.street,
			city: req.body.city,
			phone: req.body.phone,
		};

		const userId = {
			_id: req.params.id,
		};
		if (!userId) {
			throw Error("No user exist!");
		}

		const updatedUser = await User.update(userId, { $set: newUser });
		if (!updatedUser) {
			throw Error("Error occured when updating user!");
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
});

// forget password
// @route POST /forget-password
// @desc forget password
// @access public
router.post("/forget-password", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email }).exec();

		if (!user) {
			throw new Error("No user found!");
		}
		const passwordResetObj = generate(user);
		console.log(passwordResetObj);

		const msg = {
			to: req.body.email,
			from: "vandat1999123@gmail.com",
			subject: "Reset your password",
			html: `
		  <p>You requested a password reset!</p>
		  <p>Click this <a href="http://localhost:3000/auth/reset-password/${passwordResetObj.token}">link</a> to reset a new password!</p>
		  `,
		};

		await sendgridMail.send(msg);

		res.status(200).json("Sent");
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
});

// reset password
// @route POST /reset-password
// @desc reset password
// @access private
router.post("/reset-password/:token", async (req, res) => {
	try {
		const password = req.body.password;
		const token = req.params.token;

		const resetTokenObj = await ResetToken.findOneAndRemove({
			token,
			expires: { $gt: Date.now() },
		});
		if (!resetTokenObj) {
			throw new Error("Token is not valid!");
		}

		const user = await User.findOne({ email: resetTokenObj.email }).exec();

		const salt = await bcrypt.genSalt(10);

		if (!salt) {
			throw new Error("Something went wrong with bcrypt!");
		}

		const hashedPassword = await bcrypt.hash(password, salt);

		if (!hashedPassword) {
			throw Error("Something went wrong hashing the password");
		}

		user.password = hashedPassword;
		await user.save();

		res.status(200).json("password updated!");
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
});

module.exports = router;
