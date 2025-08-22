import React from 'react';
import { Github, Linkedin, Twitter, Youtube, Mail, Heart } from 'lucide-react';
import personalData from '@/data/personal.json';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: personalData.social.github, label: 'GitHub' },
    { icon: Linkedin, href: personalData.social.linkedin, label: 'LinkedIn' },
    { icon: Twitter, href: personalData.social.twitter, label: 'Twitter' },
    { icon: Youtube, href: personalData.social.youtube, label: 'YouTube' },
    { icon: Mail, href: `mailto:${personalData.email}`, label: 'Email' },
  ];

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gradient">Alex Johnson</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Full Stack & AI Engineer passionate about building intelligent applications 
              and solving complex problems with modern technologies.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
              <li><a href="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</a></li>
              <li><a href="/experience" className="text-muted-foreground hover:text-primary transition-colors">Experience</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-primary transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Alex Johnson. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> and lots of ☕
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;