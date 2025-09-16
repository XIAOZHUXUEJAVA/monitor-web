"use client";

import HostList from "@/components/hosts/HostList";

interface HostsPageProps {
  refreshKey?: number;
}

export function HostsPage({ refreshKey }: HostsPageProps) {
  return (
    <div className="space-y-6">
      <HostList 
        onHostSelect={(host) => {
          console.log('Host selected:', host);
        }}
        onHostEdit={(host) => {
          console.log('Host edit:', host);
        }}
        onHostConfig={(host) => {
          console.log('Host config:', host);
        }}
      />
    </div>
  );
}