// import React from "react";

// const TeacherDemoRequests = () => {
//   return (
//     <div>
//       <h2>Teacher Demo Requests</h2>
//       <p>Demo class requests assigned to teachers will appear here.</p>
//     </div>
//   );
// };

// export default TeacherDemoRequests;



import FreeDemoRequests from "../common/FreeDemoRequests";

const TeacherDemoRequests = () => {
  return <FreeDemoRequests role="teacher" />;
};

export default TeacherDemoRequests;
