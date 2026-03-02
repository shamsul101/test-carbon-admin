"use client";
import React from "react";
import { motion, MotionProps } from "framer-motion";
import {
  FileText,
  Info,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Globe,
  RefreshCw,
  Mail,
  Lock,
  Cookie,
  Copyright,
  Landmark,
  BadgeCheck,
} from "lucide-react";

const motionDivProps: Partial<MotionProps> = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const TERMS_LAST_UPDATED = new Date().toLocaleDateString();

const TermsAndConditions = () => {
  return (
    <section
      className="relative py-20 flex justify-center items-center min-h-screen overflow-x-hidden bg-white"
      style={{
        backgroundImage: "url('/bg-calc.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          pointerEvents: "none",
          background:
            "linear-gradient(to top right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,1) 70%, rgba(255,255,255,0.85) 80%)",
        }}
      />

      {/* Content */}
      <motion.div
        {...motionDivProps}
        className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#eaeaea]">
          {/* Header */}
          <header className="flex flex-col items-center mb-8">
            <span className="inline-flex items-center bg-primary/20 justify-center rounded-full bg-[#F7F7F7] p-3 mb-2 shadow-inner border border-[#eaeaea]">
              <FileText size={28} strokeWidth={2} className="text-primary" />
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-primary">
              Terms & Conditions
            </h1>
            <p className="text-[#767676] text-center text-base md:text-lg max-w-2xl">
              Please read these terms carefully. By using our services, you agree
              to the following.
            </p>
          </header>

          <main className="flex flex-col gap-6 mt-8">
            {/* Reusable section component */}
            {[
              {
                icon: Info,
                title: "Introduction",
                content: (
                  <>
                    Welcome to{" "}
                    <span className="font-semibold">aiemissionlab.com</span>. By
                    accessing or using our website, you agree to comply with these
                    terms and conditions. These terms apply to all visitors, users,
                    and others who access or use the site. Please read them carefully.
                  </>
                ),
              },
              {
                icon: AlertCircle,
                title: "Disclaimer",
                content: (
                  <>
                    <p className="mb-2">
                      <span className="font-semibold">aiemissionlab.com</span> is
                      provided on an &quot;as is&quot; and &quot;as available&quot;
                      basis. While Emission Lab has taken reasonable care to ensure
                      the accuracy of information presented, we provide it for
                      informational and guidance purposes only. Emission Lab is not
                      liable for any incorrect or misrepresented information on the
                      site.
                    </p>
                    <p className="mb-2">
                      Emission Lab makes no representations or warranties of any kind,
                      express or implied, regarding the site&apos;s operation,
                      information, content, materials, or products included on this
                      website. To the fullest extent permissible by applicable law,
                      Emission Lab disclaims all warranties, express or implied,
                      including but not limited to implied warranties of
                      merchantability and fitness for a particular purpose.
                    </p>
                    <p>
                      Emission Lab will not be liable for any damages of any kind
                      arising from the use of this site, including but not limited to
                      direct, indirect, incidental, punitive, or consequential
                      damages.
                    </p>
                  </>
                ),
              },
              {
                icon: Globe,
                title: "Compliance",
                content: (
                  <>
                    Our website complies with carbon regulations, the General Data
                    Protection Regulation (GDPR), and other applicable data
                    protection laws. We take steps to ensure that our operations are
                    environmentally responsible. For more information on our
                    sustainability practices, please refer to our environmental
                    policy.
                  </>
                ),
              },
              {
                icon: Lock,
                title: "GDPR Privacy Notice",
                content: (
                  <>
                    <section className="pl-1">
                      {/* Personal Data */}
                      <section className="mb-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-[#163820]">
                            Personal Data
                          </span>
                        </div>
                        <p className="text-[#767676]">
                          We are committed to safeguarding your personal data. When
                          you visit our site or interact with us, you may not need to
                          provide personal data unless for specific calculations or
                          features. Any data collected is treated with integrity and
                          confidentiality in line with GDPR principles.
                        </p>
                      </section>
                      {/* Usage of Personal Data */}
                      <section className="mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-[#163820]">
                            Usage of Personal Data
                          </span>
                        </div>
                        <p className="text-[#767676]">
                          We may use collected information to provide services, make
                          contact, and send insights related to environmental impact,
                          best practices, and compliance. By contacting us through
                          email, phone, or website forms, you consent to our
                          communication unless you decide otherwise.
                        </p>
                      </section>
                      {/* Cookies */}
                      <section className="mb-2">
                        <div className="flex items-center gap-2">
                          <Cookie className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-[#163820]">Cookies</span>
                        </div>
                        <p className="text-[#767676]">
                          Our website uses cookies to enhance user experience. You can
                          control cookie settings through your browser preferences. We
                          do not use cookies to personally identify visitors.
                        </p>
                      </section>
                      {/* Legal Basis for Processing */}
                      <section className="mb-2">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-[#163820]">
                            Legal Basis for Processing
                          </span>
                        </div>
                        <p className="text-[#767676]">
                          We process data to meet contractual obligations and respond
                          to inquiries. Our legitimate interests include promoting
                          sustainability services and maintaining compliance with
                          regulations.
                        </p>
                      </section>
                      {/* Consent and Rights */}
                      <section className="mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-[#163820]">Consent and Rights</span>
                        </div>
                        <p className="text-[#767676]">
                          By using our site, you consent to the processing of your
                          personal data for the outlined purposes. You may withdraw
                          consent at any time by contacting us.
                        </p>
                        <p className="text-[#767676]">
                          You have rights under GDPR, including access, rectification,
                          erasure, restriction, portability, and objection regarding
                          your personal data. For more information or to exercise your
                          rights, contact us directly.
                        </p>
                      </section>
                    </section>
                  </>
                ),
              },
              {
                icon: Copyright,
                title: "Copyright and Intellectual Property",
                content: (
                  <>
                    All content on{" "}
                    <span className="font-semibold">aiemissionlab.com</span>,
                    including text, graphics, logos, and software, is the property
                    of Emission Lab or its content suppliers and protected by
                    international copyright laws. Unauthorized use, reproduction,
                    modification, distribution, or display of the content is
                    prohibited.
                  </>
                ),
              },
              {
                icon: Landmark,
                title: "Trademarks",
                content: (
                  <>
                    Any trademarks not owned by Emission Lab, but appearing on this
                    site, are the property of their respective owners. Unauthorized
                    use of these trademarks is prohibited.
                  </>
                ),
              },
              {
                icon: Globe,
                title: "Applicable Law",
                content: (
                  <>
                    These terms and conditions are governed by the laws applicable
                    in the jurisdiction of Emission Lab’s operations. Users agree
                    that any legal action related to this site shall be governed by
                    these laws without regard to principles of conflicts of law.
                  </>
                ),
              },
              {
                icon: RefreshCw,
                title: "Changes to Terms",
                content: (
                  <>
                    Emission Lab reserves the right to update or modify these terms
                    and conditions at any time. Changes will be posted on this page,
                    and continued use of the site signifies acceptance of revised
                    terms.
                  </>
                ),
              },
              {
                icon: Mail,
                title: "Contact Information",
                content: (
                  <>
                    For questions or concerns regarding these terms and conditions
                    or our privacy practices, please contact us at:
                    <br />
                    <span className="font-semibold text-primary">Email:</span>{" "}
                    <a href="mailto:info@aiemissionlab.com" className="underline">
                      info@aiemissionlab.com
                    </a>
                  </>
                ),
              },
            ].map(({ icon: Icon, title, content }, idx) => (
              <article key={idx}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-6 h-6 text-secondary" aria-hidden="true" />
                  <h2 className="font-semibold text-lg text-[#163820]">{title}</h2>
                </div>
                <div className="text-[#767676]">{content}</div>
              </article>
            ))}
          </main>

          <footer className="mt-12 text-sm text-gray-500 text-center">
            <p>Last updated: {TERMS_LAST_UPDATED}</p>
          </footer>
        </div>
      </motion.div>
    </section>
  );
};

export default TermsAndConditions;
