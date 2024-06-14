// import { useSession, getSession } from 'next-auth/react';
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const Profile = () => {
//   const { data: session } = useSession();
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     if (session?.accessToken) {
//       axios.get('https://api.intra.42.fr/v2/me', {
//         headers: {
//           Authorization: `Bearer ${session.accessToken}`,
//         },
//       })
//       .then(response => setUserData(response.data))
//       .catch(error => console.error('Error fetching user data:', error));
//     }
//   }, [session]);

//   if (!session) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div>
//       <h1>Profile</h1>
//       {userData ? (
//         <div>
//           <p>Name: {userData.displayname}</p>
//           <p>Email: {userData.email}</p>
//           <img src={userData.image_url} alt={userData.displayname} />
//         </div>
//       ) : (
//         <p>Loading user data...</p>
//       )}
//     </div>
//   );
// };

// export async function getServerSideProps(context) {
//   const session = await getSession(context);
//   return {
//     props: {
//       session,
//     },
//   };
// }

// export default Profile;
