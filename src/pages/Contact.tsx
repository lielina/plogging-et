import { useState } from "react";


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

const Contact = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    // Add your form submission logic here
  };

  return (
    <section className="flex flex-col items-center gap-20 w-[100%] pb-10 mx-auto">
      <h1 className="text-5xl pb-4 border-b-2 w-fit">Contact</h1>
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexWrap: "wrap",
          gap: "80px",
        }}
      >
        <div className="flex flex-col justify-between items-center" style={{ width: "500px" }}>
          <form
            className="w-full shadow-lg shadow-form p-10 flex flex-col gap-5 rounded-md items-center"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col items-start w-full">
              <label htmlFor="name">Full Name</label>
              <input
                name="name"
                type="text"
                className="p-2 rounded-md w-full border-input border-2"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="email">Email</label>
              <input
                name="email"
                type="text"
                className="p-2 rounded-md w-full border-input border-2"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="message">Message</label>
              <textarea
                name="message"
                rows={5}
                className="p-2 rounded-md w-full border-input border-2"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-500 w-fit hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              Send
            </button>
          </form>
        </div>
        <section style={{ width: "500px" }}>
          <div className="flex flex-col gap-10">
            <div className="flex gap-10">
              <img src="/location-icon.svg" alt="location" />
              <div className="flex flex-col">
                <p>Location</p>
                <p>Addis Ababa, Ethiopia</p>
              </div>
            </div>
            <div className="flex gap-10">
              <img src="/phone-icon.svg" alt="phone" />
              <div className="flex flex-col">
                <p>+251911647424</p>
              </div>
            </div>
            <div className="flex gap-10">
              <img src="/mail-icon.svg" alt="mail" />
              <div className="flex flex-col">
                <p>info@ploggingethiopia.org</p>
              </div>
            </div>
          </div>
        </section>
      </section>
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

export default Contact;
