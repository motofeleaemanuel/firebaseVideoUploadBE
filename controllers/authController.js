const bcrypt = require("bcrypt");
const { db } = require("../firebase.js");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send({ message: "Email or password missing" });

    const existingUser = await db
      .collection("Users")
      .where("email", "==", email)
      .get();

    if (!existingUser.empty) {
      return res
        .status(400)
        .send({ message: "User with this email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userCollection = db.collection("Users");
    const userCreated = await userCollection.add({
      email,
      password: hashedPassword,
    });
    if (!userCreated)
      return res.status(400).send({ message: "User could not be created." });

    return res.status(200).send({ userCreated });
  } catch (err) {
    return res.status(500).send(err);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(401).send({ message: "Invalid credentials" });

    const user = await db.collection("Users").where("email", "==", email).get();
    const userDoc = user.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email },
      "jwtsecrettoken",
      { expiresIn: 60 * 60 }
    );

    return res.status(200).send({ token: token });
  } catch (err) {
    return res.status(400).send(err);
  }
};

const checkForAuthorization = (req, res) => {
  const { email, id } = req.user;
  if (!email || !id) return res.status(403).send({ message: "Unauthorized" });
  return res.status(200).send({ userData: { email, id } });
};

module.exports = { register, login, checkForAuthorization };
