import { useState } from "react";
import { Link } from "react-router-dom";
import story1 from "/story-1.png";

const faqs = [
  {
    question: "What is Plogging?",
    answer:
      "Plogging is a fitness and environmental activity that combines jogging with picking up litter. It's a fun and impactful way to stay active while contributing to a cleaner environment.",
  },
  {
    question: "How can I join a Plogging event?",
    answer:
      "Joining a Plogging event is easy! Check our calendar for upcoming events in your area. Simply show up on the designated day with comfortable clothing, sturdy shoes, and a pair of gloves. Participation is free!",
  },
  {
    question: "Do I need to register for events?",
    answer:
      "Registration is not mandatory, but it helps us plan for the number of participants. You can register for events on our website or simply join us on the day of the event.",
  },
  {
    question: "Can groups participate in Plogging events?",
    answer:
      "Absolutely! We encourage groups from schools, associations, organizations, and friends to join our events. It's an excellent opportunity to bond, strengthen relationships, and contribute to a healthier community.",
  },
  {
    question: "Is there an age limit for participation?",
    answer:
      "Plogging is inclusive, and participants of all ages are welcome! We encourage families, youth, and seniors to join us in making a positive impact.",
  },
  {
    question: "What do I need to bring to a Plogging event?",
    answer:
      "Come with comfortable clothing, suitable shoes for jogging, and a pair of gloves. We provide bags for collecting litter.",
  },
  {
    question: "How often do you organize Plogging events?",
    answer:
      "We organize events every Saturday and Sunday. Check our calendar for specific dates and locations.",
  },
  {
    question: "Can I organize a Plogging event in my area?",
    answer:
      "Absolutely! We welcome individuals and groups to organize Plogging events. Reach out to us, and we'll provide guidance and support.",
  },
  {
    question: "Do you provide certificates or recognition for participants?",
    answer:
      "While we don't provide certificates, we appreciate and recognize the efforts of all participants. Your contribution to a cleaner environment is a reward in itself!",
  },
  {
    question: "How can I stay updated on upcoming events and news?",
    answer:
      "Stay connected by following us on social media, and regularly check our website for updates, event announcements, and inspiring stories.",
  },
];

const Membership = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    password: "",
    agree: false,
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    // Add your form submission logic here
  };

  return (
    <section
      id="start"
      className="flex flex-col items-center gap-20 w-[90%] pb-10 mx-auto"
    >
      <div className="w-full flex flex-col gap-5 items-center">
        <h1 className="text-5xl pb-4 border-b-2 w-fit">Membership</h1>
        <p className="text-xl">
          Join our community of passionate individuals dedicated to fostering a
          healthier environment through plogging.
        </p>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-10">
        <img src={story1} className="w-full" alt="member" />
        <form
          name="member"
          className="w-full shadow-lg shadow-form p-10 flex flex-col gap-5 rounded-md"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-start w-full">
            <label htmlFor="fname">First Name</label>
            <input
              name="fname"
              placeholder="First Name"
              type="text"
              className="p-2 rounded-md w-full border-input border-2"
              value={formData.fname}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="lname">Last Name</label>
            <input
              name="lname"
              placeholder="Last Name"
              type="text"
              className="p-2 rounded-md w-full border-input border-2"
              value={formData.lname}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="email">Email</label>
            <input
              name="email"
              type="email"
              className="p-2 rounded-md w-full border-input border-2"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="phone">Phone Number</label>
            <input
              name="phone"
              type="text"
              className="p-2 rounded-md w-full border-input border-2"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              className="p-2 rounded-md w-full border-input border-2"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          >
            Sign up
          </button>
          <div className="flex items-center gap-3">
            <input
              name="agree"
              type="checkbox"
              id="agree"
              checked={formData.agree}
              onChange={handleChange}
            />
            <label htmlFor="agree">I agree to the terms and policy</label>
          </div>
          <p className="w-full flex justify-center gap-2">
            Already have an account?
            <Link to="/login">
              <span className="text-green-500">Login</span>
            </Link>
          </p>
        </form>
      </div>
      <div className="w-[90%] flex flex-col gap-5">
        <h1 className="text-5xl mb-10">FAQ?</h1>
        {faqs.map((faq, index) => (
          <div className="w-full text-left" key={index}>
            <div
              className="cursor-pointer bg-green-500/20 w-full px-5 py-2 flex justify-between"
              onClick={() => toggleFaq(index)}
            >
              {faq.question}
              <p>{openFaq === index ? "-" : "+"}</p>
            </div>
            <div
              className="w-full px-5"
              style={{ display: openFaq === index ? "block" : "none" }}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Membership;