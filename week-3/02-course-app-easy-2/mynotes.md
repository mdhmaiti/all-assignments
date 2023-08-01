# 03 easy to medium grade

This is some actual implementation of the athorization here , before we just used the middleware and passed the password and the username as authorization but here we are using the token based system known as json web token .

## how to use the json web token ?

JSON Web Tokens (JWT) are a popular way to securely transmit information between parties as a JSON object. They are commonly used to authenticate and authorize users in web applications. To use JSON Web Tokens in your application, follow these general steps:

1. **Install the Necessary Packages:** You'll need to install the required packages. In Node.js, you can use the `jsonwebtoken` package to work with JSON Web Tokens. You can install it using npm or yarn:

```bash
npm install jsonwebtoken
# or
yarn add jsonwebtoken
```

2. **Generate a Token (Signing):** When a user logs in or is authenticated, you can generate a token for them. The token should contain the necessary data (claims) about the user, such as their user ID, role, or any other relevant information. To create a token, you can use the `jsonwebtoken` package:

```javascript
const jwt = require('jsonwebtoken');

const user = {
  id: 123,
  username: 'john_doe',
  role: 'admin',
};

const secretKey = 'your_secret_key_here';

const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
console.log(token);
```

3. **Sending the Token to the Client:** Once you generate the token, you can send it back to the client (usually in the response) so that it can be stored, typically in a cookie or in the frontend's local storage.

4. **Verifying the Token (Authentication):** On subsequent requests, the client includes the token in the request (usually in the headers, like `Authorization: Bearer <token>`). On the server-side, you need to verify the token's authenticity using the same secret key:

```javascript
const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key_here';

const tokenFromClient = 'token_received_from_client';

try {
  const decodedToken = jwt.verify(tokenFromClient, secretKey);
  console.log(decodedToken); // This will contain the user information (claims)
} catch (error) {
  console.log('Invalid token');
}
```

5. **Authorization and Access Control:** After verifying the token, you can use the information from the token (e.g., user ID or role) to perform authorization checks and grant access to certain resources or routes.

Remember to keep your secret key secure, as it is used both to sign and verify the tokens. It's also a good practice to set a reasonably short expiration time (`expiresIn`) for the token to ensure that it remains valid for a limited duration.

JSON Web Tokens provide a stateless and secure way to handle authentication and authorization in web applications. However, it's essential to implement other security measures as well, such as protecting against cross-site request forgery (CSRF) and ensuring that sensitive data is not leaked in the token payload.
