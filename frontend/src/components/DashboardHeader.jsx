import React from 'react';

export default function DashboardHeader({ company, role }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="text-gray-600 dark:text-gray-300 text-sm mt-2 md:mt-0">
        <span className="font-medium">Company:</span> {company} &nbsp; | &nbsp;
        <span className="font-medium">Role:</span> {role}
      </div>
    </div>
  );
}
