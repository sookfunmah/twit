// import jwt from "jsonwebtoken"

// export const generateTokenAndSetCookie = (userId,res) =>{
//     const token = jwt.sign({userId},process.env.JWT_SECRET,{
//         expiresIn : '15d'
//     })

//     res.cookie("jwt",token, {
//         maxAge: 15*24*60*60*1000, // mS
//         httpOnly: true, // prevent XSS attacks cross-site scrpting attacks
//         sameSite: "strict",  //CSRF attacks cross site request forgery attacks
//         secure:process.env.NODE_ENV !== "development",
//     })
// }


import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  try {
    console.time('tokenGeneration');
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '15d'
    });
    console.timeEnd('tokenGeneration');

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    return token; // Optionally return the token if needed elsewhere
  } catch (error) {
    console.error("Error generating token:", error);
    // Handle error appropriately
    throw error; // Re-throw the error to be handled by the calling function
  }
};