"use client";

import React, { useState, useEffect } from "react";
import "../styles/hero-styles.css";
import Aurora from "./Aurora";
import GlobeWireframe from "./globe-wireframe";

const locations: [number, number][] = [
  [37.7749, -122.4194], // SF - Autonomous Agent Hub
  [40.7128, -74.0060], // NY - Financial Settlement Hub
  [51.5074, -0.1278], // London - Fintech Node
  [25.2048, 55.2708], // Dubai - Global Treasury
  [1.3521, 103.8198], // Singapore - Asian Settlement Fabric
  [-33.8688, 151.2093], // Sydney - APAC Node
  [35.6762, 139.6503], // Tokyo - Robotics & AI Exchange
  [48.8566, 2.3522], // Paris - European Regulatory Gateway
  [55.7558, 37.6176], // Moscow - Node
  [19.0760, 72.8777], // Mumbai - High Velocity Compute Node
  [34.0522, -118.2437], // LA - Media Agent Fleet
  [41.8781, -87.6298], // Chicago - Derivatives & Liquidity
  [-23.5505, -46.6333], // Sao Paulo - LatAm Hub
  [-34.6037, -58.3816], // Buenos Aires - Regional Node
  [6.5244, 3.3792], // Lagos - African FinTech Cluster
  [-1.2921, 36.8219], // Nairobi - East Africa Node
  [39.9042, 116.4074], // Beijing - Compute Grid
  [22.3193, 114.1694], // Hong Kong - Cross-Border Settlement
  [28.6139, 77.2090], // New Delhi - Developer Guild
];

const connections = [
  { start: locations[1], end: locations[2] }, // NY -> London
  { start: locations[0], end: locations[6] }, // SF -> Tokyo
  { start: locations[11], end: locations[7] }, // Chicago -> Paris
  { start: locations[2], end: locations[3] }, // London -> Dubai
  { start: locations[7], end: locations[8] }, // Paris -> Moscow
  { start: locations[2], end: locations[14] }, // London -> Lagos
  { start: locations[3], end: locations[9] }, // Dubai -> Mumbai
  { start: locations[3], end: locations[4] }, // Dubai -> Singapore
  { start: locations[9], end: locations[4] }, // Mumbai -> Singapore
  { start: locations[4], end: locations[6] }, // Singapore -> Tokyo
  { start: locations[6], end: locations[16] }, // Tokyo -> Beijing
  { start: locations[16], end: locations[17] }, // Beijing -> HK
  { start: locations[17], end: locations[4] }, // HK -> Singapore
  { start: locations[18], end: locations[4] }, // Delhi -> Singapore
  { start: locations[4], end: locations[5] }, // Singapore -> Sydney
  { start: locations[5], end: locations[10] }, // Sydney -> LA
  { start: locations[1], end: locations[12] }, // NY -> Sao Paulo
  { start: locations[10], end: locations[12] }, // LA -> Sao Paulo
  { start: locations[12], end: locations[13] }, // Sao Paulo -> BA
  { start: locations[14], end: locations[15] }, // Lagos -> Nairobi
  { start: locations[3], end: locations[15] }, // Dubai -> Nairobi
];

export default function HackitHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="home-hero">
      <Aurora
        colorStops={["#3b82f6", "#8b5cf6", "#ec4899"]}
        blend={0.5}
        amplitude={0.15}
        speed={0.4}
      />

      <h1 className="hero-title">
        Hire and <img src="/landing/assets/rocket.png" alt="rocket" className="title-emoji" />
        Deploy Your <br /> Autonomous Agent Workforce in <span className="accent">Real Time</span>
      </h1>

      <div 
        className="relative flex justify-center w-full overflow-hidden" 
        style={{ 
          height: '225px', 
          marginTop: '40px', 
          marginBottom: '20px',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}
      >
        {/* Subtle Glowing Backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Globe */}
        <div className="absolute top-0 flex justify-center w-full">
          {mounted ? (
            <div className="animate-in fade-in duration-1000 ease-in-out">
              <GlobeWireframe 
                className='w-[450px] h-[450px] z-50 relative' 
                variant='solid' 
                locations={locations}
                connections={connections}
              />
            </div>
          ) : (
            <div className="w-[450px] h-[450px] rounded-full border-[1px] border-blue-500/10 shadow-[0_0_80px_rgba(59,130,246,0.05)] animate-pulse z-50 relative" />
          )}
        </div>
      </div>

      {/* CURVED LINES (SVG) with Floating Icon Cards */}
      <div className="hero-lines">
        <div className="line-group left-outer">
          <img src="/landing/assets/Vector 2681.png" alt="Left Outer Line" className="line" />
          <img src="/landing/assets/gear.png" alt="Autonomous Broker" className="icon-card" title="Autonomous Broker Engine" />
        </div>

        <div className="line-group left-inner">
          <img src="/landing/assets/Vector 2682.png" alt="Left Inner Line" className="line" />
          <img src="/landing/assets/rocket-small.png" alt="Instant Settlement" className="icon-card" title="Instant Settlement" />
        </div>

        <div className="line-group right-inner">
          <img src="/landing/assets/Vector 2683.png" alt="Right Inner Line" className="line" />
          <img src="/landing/assets/light.png" alt="Verifiable Escrow" className="icon-card" title="Verifiable Escrow" />
        </div>

        <div className="line-group right-outer">
          <img src="/landing/assets/Vector 2684.png" alt="Right Outer Line" className="line" />
          <img src="/landing/assets/monitor.png" alt="Executive Cockpit" className="icon-card" title="Executive Cockpit" />
        </div>

      </div>

      <div className="brands-row flex flex-col items-center gap-1 mt-10 relative z-20">
        <span className="text-gray-500 text-base font-medium m-0">Settling Autonomous AI Commerce For</span>
        <span className="text-gray-900 text-2xl font-semibold m-0">Enterprises & Autonomous Fleets Worldwide</span>
      </div>

      {/* Ultra-smooth gradual multi-stop fade into the dark cosmic section */}
      <div 
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[480px] z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(243, 247, 248, 0) 0%, rgba(243, 247, 248, 0.05) 20%, rgba(200, 218, 226, 0.25) 45%, rgba(90, 125, 148, 0.5) 68%, rgba(25, 60, 85, 0.8) 85%, #022336 100%)'
        }}
      />
    </section>
  );
}
