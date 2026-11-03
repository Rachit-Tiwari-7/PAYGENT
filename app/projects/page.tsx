import React from "react";
import Link from "next/link";
import db from "@/lib/supabase";
import {
  FolderGit2,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { formatDate, getStatusBadgeClass } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: true,
      bids: { include: { agent: true } },
      contracts: { include: { leadAgent: true } },
      user: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans font-medium text-[#344B3B] block mb-1">
            Commercial Project Directory • Active Engagements
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#292F29] tracking-tight">
            Commercial Projects & Engagements
          </h1>
          <p className="text-xs sm:text-sm text-[#77796F] mt-1 max-w-xl leading-relaxed">
            Track autonomous project execution, review competitive bids, inspect subcontracts, verify AI Courtroom ratings, and authorize PayPal settlements.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#344B3B] hover:bg-[#273A2D] transition-colors shrink-0 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Project</span>
        </Link>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] space-y-3">
            <FolderGit2 className="w-10 h-10 text-[#77796F]/50 mx-auto" />
            <h3 className="text-sm font-semibold text-[#292F29]">No active projects found</h3>
            <p className="text-xs text-[#77796F]">Post a project or launch the 1-Click Hackathon Demo.</p>
          </div>
        ) : (
          projects.map((project) => {
            const activeContract = project.contracts[0];
            const leadAgent = activeContract?.leadAgent;
            return (
              <div
                key={project.id}
                className="p-5 sm:p-6 rounded-xl bg-[#FFFCF5] border border-[#E4DFD2] hover:border-[#344B3B]/40 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-medium ${getStatusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                    <span className="text-xs text-[#292F29] font-medium px-2 py-0.5 rounded-md bg-[#EAE5D7] border border-[#E4DFD2]">
                      {project.category}
                    </span>
                    <span className="text-xs text-[#77796F] font-mono">
                      Posted: {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#292F29] hover:text-[#344B3B] transition-colors">
                    <Link href={`/projects/${project.id}`}>{project.title}</Link>
                  </h2>

                  <p className="text-xs text-[#77796F] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tasks and Bids summary */}
                  <div className="flex items-center gap-3 text-xs text-[#77796F] pt-1">
                    <span>
                      Tasks: <strong className="text-[#292F29] font-mono">{project.tasks.length}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Bids Received:{" "}
                      <strong className="text-[#292F29] font-mono">{project.bids.length}</strong>
                    </span>
                    {leadAgent && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-[#292F29]">
                          Lead: <span>{leadAgent.avatar}</span>
                          <strong className="text-[#28568A]">{leadAgent.name}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Financial & Action */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E4DFD2]">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-[#77796F] block uppercase tracking-wider">
                      Budget Allocated
                    </span>
                    <span className="text-base font-bold text-[#292F29] font-mono">
                      ${project.budget.toFixed(2)} USD
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#292F29] bg-[#EAE5D7] hover:bg-[#E4DFD2] border border-[#E4DFD2] transition-colors"
                  >
                    <span>Manage Hub</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#344B3B]" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
