import { Leaf, Heart, Recycle, Shield, Users, Award, TreePine } from 'lucide-react';

const values = [
    { icon: Leaf, title: 'Clean Label', desc: 'Every ingredient is traceable and honest. We believe you deserve to know exactly what you eat.' },
    { icon: Heart, title: 'Made with Love', desc: 'Crafted in small batches by people who genuinely care about your health and taste buds.' },
    { icon: Recycle, title: 'Eco-Responsible', desc: 'Our packaging is fully recyclable and our production minimizes waste at every step.' },
    { icon: Shield, title: 'Nutritionist Approved', desc: 'All recipes are developed with certified nutritionists for maximum health benefits.' },
];

const team = [
    { name: 'Rohini Pillai', role: 'Founder', emoji: '👩‍💼', bio: 'Visionary founder dedicated to bringing nutritious and delicious healthy snacks to every home.' },
    { name: 'Joshua Mathew', role: 'Co-Founder', emoji: '👨‍💼', bio: 'Passionate innovator committed to sustainable practices and quality roasted snacking.' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="py-24 text-center" style={{ background: 'linear-gradient(135deg, #475d2a, #3a4620)' }}>
                <div className="page-container">
                    <div className="badge mb-6 animate-slideInTop" style={{ background: 'rgba(223,196,172,0.2)', color: 'rgb(223, 196, 172)' }}>Our Story</div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fadeInUp">Born from a <span style={{ color: 'rgb(223, 196, 172)' }}>Craving</span></h1>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fadeInUp delay-100">
                        ShuddhEats started when our founder couldn't find a single snack at the local store that was genuinely clean, tasty, and affordable. So we made one. Then nine. Then a whole brand.
                    </p>
                </div>
            </section>

            {/* The Story */}
            <section className="py-20 bg-white">
                <div className="page-container">
                    <div className="max-w-3xl mx-auto">
                        <div className="badge badge-primary mb-6 animate-slideInTop">Our Story</div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 animate-fadeInUp" style={{ color: '#475d2a' }}>
                            ShuddhEats began with a simple question I kept asking myself every day
                        </h2>

                        <div className="space-y-6 text-lg leading-relaxed text-gray-700 animate-fadeInUp delay-100">
                            <p>
                                <span className="font-semibold" style={{ color: '#475d2a' }}>Why is it so hard to find snacks that are both healthy and genuinely enjoyable?</span>
                            </p>

                            <p>
                                Like many working professionals and families, I often reached for convenient snacks during busy days, only to realize they were full of preservatives and ingredients I couldn't even pronounce. I wanted something better — something pure, nutritious, and guilt-free that people could enjoy every day.
                            </p>

                            <p>
                                <span className="font-semibold" style={{ color: '#475d2a' }}>That's how ShuddhEats was born.</span> Our mission is simple: to make healthy snacking easy, delicious, and accessible for everyone — from busy professionals to growing kids and families. We also believe that caring for our health should go hand-in-hand with caring for our planet, which is why we strive to build an eco-friendly and sustainable brand.
                            </p>

                            <p className="text-base italic" style={{ color: '#5a6a4a' }}>
                                ShuddhEats isn't just about snacks — it's about creating better everyday habits for healthier lives.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 bg-white">
                <div className="page-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="animate-slideInLeft">
                            <div className="badge badge-primary mb-4">Our Mission</div>
                            <h2 className="section-title mb-6">Making Healthy Snacking the Easy Choice</h2>
                            <p className="section-subtitle mb-4">We believe that snacking shouldn't be a guilty pleasure. It should be an act of self-care — something you do because it tastes amazing AND makes your body feel good.</p>
                            <p className="section-subtitle">ShuddhEats bridges the gap between "good for you" and "good to eat". Using roasted preparation, clean spice blends, and honest ingredients, we're proving that health and taste can coexist.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 animate-slideInRight">
                            {[['10K+', 'Happy Customers'], ['9', 'Products'], ['3', 'Categories'], ['0', 'Artificial Additives']].map(([n, l]) => (
                                <div key={l} className="card p-6 text-center">
                                    <div className="text-3xl font-extrabold mb-1" style={{ color: 'rgb(223, 196, 172)' }}>{n}</div>
                                    <div className="text-sm font-medium" style={{ color: '#475d2a' }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20" style={{ background: '#f0f4ed' }}>
                <div className="page-container">
                    <div className="text-center mb-12 animate-fadeInUp">
                        <div className="badge badge-primary mb-4">Our Values</div>
                        <h2 className="section-title">What We Stand For</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map(({ icon: Icon, title, desc }, index) => (
                            <div key={title} className="card p-6 text-center animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f0f4ed' }}>
                                    <Icon className="w-7 h-7" style={{ color: '#475d2a' }} />
                                </div>
                                <h3 className="font-bold text-lg mb-2" style={{ color: '#475d2a' }}>{title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-white">
                <div className="page-container">
                    <div className="text-center mb-12">
                        <div className="badge badge-primary mb-4">The Team</div>
                        <h2 className="section-title">Meet the Founders</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {team.map(({ name, role, emoji, bio }) => (
                            <div key={name} className="card p-6 text-center animate-fadeInUp">
                                <div className="text-5xl mb-4">{emoji}</div>
                                <h3 className="font-bold text-lg" style={{ color: '#475d2a' }}>{name}</h3>
                                <p className="text-sm font-semibold text-gray-400 mb-3">{role}</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20" style={{ background: '#f0f4ed' }}>
                <div className="page-container">
                    <div className="text-center mb-12">
                        <div className="badge badge-primary mb-4">Get In Touch</div>
                        <h2 className="section-title">Contact Us</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="card p-8 text-center animate-scaleIn">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#475d2a' }}>Location</h3>
                            <p className="text-gray-600">Mumbai</p>
                        </div>
                        <div className="card p-8 text-center animate-scaleIn" style={{ animationDelay: '0.1s' }}>
                            <div className="text-4xl mb-4">✉️</div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#475d2a' }}>Email</h3>
                            <a href="mailto:shuddheats3126@gmail.com" className="text-gray-600 hover:text-primary transition">shuddheats3126@gmail.com</a>
                        </div>
                        <div className="card p-8 text-center animate-scaleIn" style={{ animationDelay: '0.2s' }}>
                            <div className="text-4xl mb-4">📞</div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#475d2a' }}>Phone</h3>
                            <div className="text-gray-600">
                                <a href="tel:8850823761" className="hover:text-primary transition block">8850823761</a>
                                <a href="tel:8779465991" className="hover:text-primary transition block">8779465991</a>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <a href="www.shuddheats.co.in" className="text-lg font-semibold" style={{ color: 'rgb(223, 196, 172)' }}>www.shuddheats.co.in</a>
                    </div>
                </div>
            </section>

            {/* Eco CTA */}
            <section className="py-16" style={{ background: '#475d2a' }}>
                <div className="page-container text-center animate-fadeInUp">
                    <TreePine className="w-12 h-12 mx-auto mb-4 animate-bounce-slow" style={{ color: 'rgb(223, 196, 172)' }} />
                    <h2 className="text-3xl font-extrabold text-white mb-3">We Plant a Tree for Every 50 Orders</h2>
                    <p className="text-white/70 max-w-md mx-auto mb-6">Your purchase contributes to reforestation projects across India. Snack and give back.</p>
                </div>
            </section>
        </div>
    );
}
