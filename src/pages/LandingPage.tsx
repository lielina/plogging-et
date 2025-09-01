import { Button } from "@/components/ui/button";
import {
  Menu,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Leaf,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const faqItems = [
    {
      question: "What is Plogging?",
      answer:
        "Plogging is a fitness and environmental activity that combines jogging with picking up litter. It's a fun and impactful way to stay active while contributing to a cleaner environment.",
    },
    {
      question: "How often does Plogging events?",
      answer:
        "We organize plogging events regularly, typically every weekend in different locations around Addis Ababa. Check our events page for the latest schedule.",
    },
    {
      question: "How does plogging be started?",
      answer:
        "Getting started is easy! Simply join one of our events, bring comfortable running shoes, and we'll provide the equipment needed for collecting litter.",
    },
    {
      question: "Can groups participate in Plogging events?",
      answer:
        "We welcome groups, families, schools, and organizations. Group participation makes the activity more fun and impactful.",
    },
    {
      question: "Is there an age limit for participation?",
      answer:
        "Plogging is suitable for all ages. Children should be accompanied by adults, and we adapt activities to ensure everyone can participate safely.",
    },
    {
      question: "What do I need to bring to a Plogging event?",
      answer:
        "Just bring comfortable running/walking shoes, water, and enthusiasm! We provide gloves, bags, and other equipment needed for the cleanup.",
    },
    {
      question: "How often do you organize Plogging events?",
      answer:
        "We organize events every weekend, with special events during environmental awareness days and holidays.",
    },
    {
      question: "Can I organize a Plogging event in my area?",
      answer:
        "Yes! We support community leaders who want to organize local events. Contact us for guidance and support in setting up events in your area.",
    },
    {
      question: "Do you provide certificates or recognition for participants?",
      answer:
        "Yes, we provide digital certificates for participants and special recognition for regular volunteers and outstanding contributors.",
    },
    {
      question: "How can I stay updated on upcoming events and news?",
      answer:
        "Follow us on social media, subscribe to our newsletter, or check our website regularly for the latest updates on events and news.",
    },
  ];

  // Intersection Observer to detect when sections are in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-section-index'));
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.setAttribute('data-section-index', index.toString());
        observer.observe(ref);
      }
    });

    return () => {
      sectionRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="Plogging Ethiopia Logo"
                  className="h-28 w-auto ml-5"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-12 mr-10">
              {[
                { name: "Home", to: "/" },
                { name: "About", to: "/about" },
                { name: "Membership", to: "/membership" },
                { name: "Gallery", to: "/gallery" },
                { name: "Blog", to: "/blog" },
                { name: "Event", to: "/events" },
                { name: "Contact", to: "/contact" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative pb-1 font-normal text-xl transition-colors ${
                      isActive
                        ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                        : "text-black hover:text-green-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-3">
                {[
                  { name: "Home", to: "/" },
                  { name: "About", to: "/about" },
                  { name: "Membership", to: "/membership" },
                  { name: "Gallery", to: "/gallery" },
                  { name: "Blog", to: "/blog" },
                  { name: "Event", to: "/events" },
                  { name: "Contact", to: "/contact" },
                ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "text-green-600 font-medium"
                        : "text-gray-700 hover:text-green-600"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center text-white overflow-hidden">
        {/* Background Image with Black Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/header-left.png')" }}
          >
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
        </div>

        {/* Bold Green Diagonal Overlay with White Borders */}
        <div className="absolute right-0 top-0 h-full w-[30%] transform -skew-x-[30deg] origin-top-right z-10 flex">
          {/* Left white edge */}
          <div className="w-10 h-full bg-white/30"></div>

          {/* Green diagonal */}
          <div className="flex-1 bg-green-600 opacity-80 shadow-xl"></div>

          {/* Right white edge */}
          <div className="w-10 h-full bg-white/30"></div>
        </div>

        {/* Content - positioned above backgrounds */}
        <main className="relative z-20 w-full flex flex-col items-center gap-20 pb-0">
          <div className="grid md:grid-cols-2 w-full text-white font-[serf] py-10 pl-5">
            <div className="flex flex-col items-center justify-around w-full gap-10">
              <h1 className="md:text-7xl text-4xl font-normal text-left text-wrap">
                Welcome to <span className="flex flex-col">Plogging Ethiopia</span>
              </h1>
              <p className="italic text-3xl">
                Stride with purpose, and cleanse with passion!
              </p>
              <div className="flex items-center justify-between">
                <button className="bg-green-500 hover:bg-green-700 text-white h-fit font-light py-2 px-4 rounded self-start">
                  <a href="/#aboutus">Read More +</a>
                </button>
                <img
                  className="w-1/2 rounded-full pl-2 pt-1 bg-green-500"
                  alt="Plogging Ethiopia"
                  src="/logo.png"
                />
              </div>
            </div>

            <div className="relative z-20">
              <img src="/header-left.png" alt="Plogging illustration" />
            </div>
          </div>
        </main>
      </section>

      {/* Our Story Section with transition */}
      <section
        ref={el => sectionRefs.current[0] = el}
        className={`py-16 px-4 bg-white w-full flex flex-col items-center justify-center transition-all duration-700 transform ${
          visibleSections.has(0) 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
            {/* Text Content */}
            <div className="flex flex-col items-start gap-6 md:w-[60%] w-full md:order-1 order-2 p-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 text-left">
                Our Story
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                Plogging-Ethiopia traces its origins back to a family excursion
                that spanned more than five years before officially launching in
                January 2021 at Entoto Park, Addis Ababa. The individuals behind
                this initiative are Firew Kefyalew, a father, and his three sons
                – Yeab, Lihiq, and Amnen.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                Plogging-Ethiopia goes beyond simply collecting trash; it
                represents a dynamic movement that combines physical fitness,
                community involvement, and environmental responsibility. The
                concept, originating from Sweden, quickly gained momentum as
                Firew and a growing community of volunteers realized its
                potential to make a meaningful impact in Ethiopia. Our dedicated
                volunteers, comprising students and professionals alike, unite
                under a shared objective: fostering a healthier Ethiopia by
                tackling plastic pollution and advocating for an active way of
                life.
              </p>
            </div>

            {/* Image Section */}
            <div className="md:order-2 order-1 w-full md:w-[40%] flex justify-center items-center p-4">
              <img
                src="/story-1.png"
                alt="Plogging Activity"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is Plogging Section with transition */}
      <section
        ref={el => sectionRefs.current[1] = el}
        className={`py-16 px-4 bg-gray-50 w-full flex flex-col items-center justify-center transition-all duration-700 delay-100 transform ${
          visibleSections.has(1)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
            {/* Image Section */}
            <div className="md:order-1 order-2 w-full md:w-[40%] flex justify-center items-center p-4">
              <img
                src="/story-2.png"
                alt="What is Plogging"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start gap-6 md:w-[60%] w-full md:order-2 order-1 p-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 text-left">
                What is Plogging?
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                Plogging is more than an exercise routine; it's a revolutionary
                approach to environmental stewardship. Participants jog or walk,
                intermittently stopping to pick up litter along their route.
                This simple yet powerful activity not only promotes physical
                fitness but also raises awareness about the impact of plastic
                pollution on our communities and environment.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                The beauty of plogging lies in its accessibility and immediate
                impact. Whether you're a seasoned runner or prefer a leisurely
                walk, plogging adapts to your fitness level while contributing
                to a cleaner, healthier environment for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section with transition */}
      <section
        ref={el => sectionRefs.current[2] = el}
        className={`py-16 px-4 bg-white w-full flex flex-col items-center justify-center transition-all duration-700 delay-200 transform ${
          visibleSections.has(2)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
            {/* Text Content */}
            <div className="flex flex-col items-start gap-6 md:w-[60%] w-full md:order-1 order-2 p-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 text-left">
                Mission
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                At the core of Plogging-Ethiopia is a mission to create a
                cleaner, greener Ethiopia while promoting physical fitness and
                community engagement. Every stride has impact, can pave the way
                for substantial change. By encouraging plogging, we aim to
                inspire people to take responsibility for their environment
                while promoting an active and healthy lifestyle.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                We believe that small actions, when multiplied by millions of
                people, can transform the world. Our mission extends beyond
                cleaning up litter – we're building a movement that fosters
                environmental consciousness and community solidarity across
                Ethiopia.
              </p>
            </div>

            {/* Image Section */}
            <div className="md:order-2 order-1 w-full md:w-[40%] flex justify-center items-center p-4">
              <div className="w-80 h-80 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/story-3.png"
                  alt="Mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section with transition */}
      <section
        ref={el => sectionRefs.current[3] = el}
        className={`py-16 px-4 bg-gray-50 w-full flex flex-col items-center justify-center transition-all duration-700 delay-300 transform ${
          visibleSections.has(3)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
            {/* Image Section */}
            <div className="md:order-1 order-2 w-full md:w-[40%] flex justify-center items-center p-4">
              <div className="w-80 h-80 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/story-4.png"
                  alt="Our Impact"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start gap-6 md:w-[60%] w-full md:order-2 order-1 p-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 text-left">
                Our Impact
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed font-sans">
                Plogging Ethiopia's remarkable achievements have gained both
                national and international recognition. Since our inception, we
                have organized numerous events, contributed to Ethiopia's Prime
                Minister for their exceptional community service. Despite
                starting from humble beginnings without an official office, our
                impact has been profound. We have successfully organized events
                that have attracted hundreds of participants, collected tons of
                waste, and raised collective action and the positive energy that
                drives social change. Our movement has become a symbol of
                grassroots environmental activism in Ethiopia, inspiring similar
                initiatives across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section with transition */}
      <section
        ref={el => sectionRefs.current[4] = el}
        id="aboutus"
        className={`relative grid md:grid-cols-2 w-[90%] mx-auto md:h-[85vh] shadow-lg transition-all duration-700 delay-400 transform ${
          visibleSections.has(4)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Left Image */}
        <img
          src="/about-5.png"
          className="rounded-md"
          alt="story"
        />

        {/* Empty Spacer or Background Column */}
        <div className="hidden md:block"></div>

        {/* Floating Content Block with Headings and Paragraph */}
        <div className="md:absolute p-4 right-0 top-1/3 md:w-4/5 w-full flex flex-col md:flex-row justify-around gap-5 ml-auto">
          <img
            src="/about-6.png"
            className="rounded-md"
            alt="story"
          />
          <div className="flex flex-col items-start md:w-3/4 w-[90%] gap-6 text-left">
            <h1 className="text-4xl md:text-5xl font-bold font-sans mt-4">
              About us
            </h1>
            <h2 className="text-3xl text-left font-semibold mt-2 text-center">
              Welcome to Plogging-Ethiopia
            </h2>
            <p className="font-sans text-lg">
              Embark on a journey of impact and sustainability with
              Plogging-Ethiopia! As trailblazers in the movement for a greener
              Ethiopia, we are more than a voluntary initiative — we are a
              community dedicated to transforming lives and our environment, one
              stride at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Landing Form Section with transition */}
      <section
        ref={el => sectionRefs.current[5] = el}
        className={`w-full grid place-items-center mt-20 landing-form transition-all duration-700 delay-500 transform ${
          visibleSections.has(5)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* You can insert your form or content here */}
      </section>

      {/* Message From The Founder Section with transition */}
      <section
        ref={el => sectionRefs.current[6] = el}
        className={`founder-message grid md:grid-cols-2 place-items-center w-[90%] mx-auto gap-6 shadow-lg transition-all duration-700 delay-600 transform ${
          visibleSections.has(6)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Text Block */}
        <div className="flex flex-col text-left gap-6 p-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Message From The Founder
          </h1>
          <p className="font-sans text-lg text-gray-700">
            Welcome, Esteemed Visitors!
          </p>
          <p className="font-sans text-lg text-gray-700">
            Step into the world of Plogging-Ethiopia's website, where passion
            and purpose unite to create a cleaner and healthier Ethiopia. As the
            founder, I am absolutely thrilled to have you explore our website
            and witness the incredible efforts of individuals who are dedicated
            to the well-being of our environment through plogging.
          </p>
          <p className="font-sans text-lg text-gray-700">
            We are a young and vibrant organization, constantly striving to
            inspire change one eco-friendly stride at a time. By harnessing the
            power of positive energy expressed through volunteerism, we aim to
            bring about organic social change driven by individuals like
            yourself. Take a deep dive into our pages to discover our
            initiatives, join our events, and find valuable resources to embrace
            sustainable living. Together, we can make a lasting impact on our
            environment.
          </p>
          <p className="font-sans text-lg text-gray-700">
            Thank you for embarking on this journey with us towards a more
            vibrant and greener Ethiopia. Your support is truly invaluable.
          </p>
          <p className="font-sans text-lg text-gray-700">With warm regards,</p>
          <p className="font-sans text-lg font-semibold text-gray-800">
            Firew Kefyalew
          </p>
          <p className="font-sans text-lg text-gray-600">
            Founder, Plogging-Ethiopia.
          </p>
        </div>

        {/* Founder Image */}
        <img
          src="/founder-photo.png"
          className="w-full h-full object-cover rounded-md"
          alt="Mr. Firew Kefyalew"
        />
      </section>

      {/* FAQ Section with transition */}
      <section
        ref={el => sectionRefs.current[7] = el}
        className={`w-full flex flex-col items-center mt-20 transition-all duration-700 delay-700 transform ${
          visibleSections.has(7)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="w-[90%] flex flex-col gap-5">
          <h1 className="text-5xl mb-10 text-start">FAQ?</h1>

          {faqItems.map((item, index) => (
            <div key={index} className="w-full text-left">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="cursor-pointer bg-green-500/20 w-full px-5 py-4 flex justify-between items-center"
              >
                <span className="font-none text-2xl text-gray-800">
                  {item.question}
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {openFaq === index ? "–" : "+"}
                </span>
              </button>

              {openFaq === index && (
                <div className="w-full px-5 py-2 bg-white text-lg">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center bg-green-500/10">
        <section className="flex justify-between w-[80%] py-10 md:flex-row flex-col gap-10">
          {/* Useful Links */}
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-green-500 font-semibold">Useful Links</h1>
            <a className="hover:text-green-500" href="/">
              Home
            </a>
            <a className="hover:text-green-500" href="/gallery">
              Gallery
            </a>
            <a className="hover:text-green-500" href="/blog">
              Blog
            </a>
            <a className="hover:text-green-500" href="/contact">
              Contact Us
            </a>
          </div>

          {/* Subscribe */}
          <div className="flex flex-col md:items-center gap-3">
            <h1 className="uppercase font-semibold text-green-700">
              Subscribe
            </h1>
            <p className="text-sm text-gray-700 text-center md:text-left">
              Sign up with your email address to receive news and updates.
            </p>
            <form className="flex w-full max-w-md">
              <input
                name="email"
                type="email"
                className="p-2 rounded-l-md border-2 border-green-500 w-full border-r-0 focus:outline-none text-gray-800"
                placeholder="Your email address"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 border-2 border-green-500 text-white font-bold py-2 px-4 rounded-r-md"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-green-600 font-semibold">Social Media</h1>
            <div className="flex gap-6 items-center">
              <Facebook className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Instagram className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Twitter className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Youtube className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
              <Linkedin className="w-6 h-6 text-green-600 hover:text-green-800 cursor-pointer" />
            </div>
          </div>
        </section>

        {/* Footer Bottom */}
        <div className="w-full flex py-2 text-white items-center justify-around bg-green-500/80 text-sm">
          <p>&copy; 2024 Plogging-Ethiopia, All rights reserved.</p>
          <p>
            Powered by{" "}
            <a
              href="https://kasmasolution.com"
              className="hover:text-white/70 cursor-pointer"
            >
              Kasma Tech Solution
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}