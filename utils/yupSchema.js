const yup = require("yup");

const linkSchema = yup.object({
  body: yup.object({
    email: yup.string().email("Please enter a valid email").required(),
    password: yup
      .string()
      .required("No password provided.")
      .min(6, "Password is too short - should be 6 chars minimum."),
  }),
});

module.exports = { linkSchema };
