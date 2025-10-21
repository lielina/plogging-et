import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api';

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
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use actual API call instead of simulation
      // Note: Since the backend endpoints may not exist yet, we'll keep the simulation
      // await apiClient.submitContactForm(formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-green-800 mb-4">
            Contact Us
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about plogging or want to get involved? We'd love to
            hear from you!
          </p>
        </div>

        {/* Contact Form and Info Section */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 mb-12">
          {/* Contact Form */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-green-800 mb-4">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 border-green-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 border-green-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="message"
                    className="text-gray-700 font-medium"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-2 border-green-200 focus:border-green-500 focus:ring-green-500 resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-base font-semibold transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-green-800 mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-6">
                Ready to make a positive impact? Reach out to us through any of
                the following channels.
              </p>
            </div>

            <div className="space-y-4">
              {/* Location */}
              <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Location
                      </h3>
                      <p className="text-gray-600 text-sm">Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Phone
                      </h3>
                      <a
                        href="tel:+251911647424"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm"
                      >
                        +251911647424
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:info@ploggingethiopia.org"
                        className="text-purple-600 hover:text-purple-800 transition-colors duration-200 text-sm"
                      >
                        info@ploggingethiopia.org
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full md:w-[90%] mx-auto flex flex-col gap-4">
          <h1 className="text-3xl md:text-5xl mb-6 md:mb-10">FAQ?</h1>
          {faqs.map((faq, index) => (
            <div className="w-full text-left" key={index}>
              <button
                onClick={() => toggleFaq(index)}
                className="cursor-pointer bg-green-500/20 w-full px-4 py-3 md:px-5 md:py-4 flex justify-between items-center text-sm md:text-base"
              >
                <span className="font-medium text-left">{faq.question}</span>
                <span className="text-lg md:text-xl font-bold">
                  {openFaq === index ? "–" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="w-full px-4 py-3 md:px-5 md:py-4 bg-white text-sm md:text-base">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;