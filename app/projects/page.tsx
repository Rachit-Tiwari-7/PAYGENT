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
      <div className="p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFECDF] text-[#30332B] text-[11px] font-semibold mb-2">
            <FolderGit2 className="w-3.5 h-3.5 text-[#727B50]" />
            <span>Commercial Projects</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#30332B]">
            Project & Workforce Management
          </h1>
          <p className="text-xs sm:text-sm text-[#73766C] mt-1 max-w-xl leading-relaxed">
            Track autonomous project execution, review competitive bids, inspect subcontracts, verify AI Courtroom ratings, and authorize PayPal settlements.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#727B50] hover:bg-[#616A42] transition-colors shrink-0 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Project</span>
        </Link>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] space-y-3">
            <FolderGit2 className="w-10 h-10 text-[#73766C]/50 mx-auto" />
            <h3 className="text-sm font-semibold text-[#30332B]">No active projects found</h3>
            <p className="text-xs text-[#73766C]">Post a project or launch the 1-Click Hackathon Demo.</p>
          </div>
        ) : (
          projects.map((project) => {
            const activeContract = project.contracts[0];
            const leadAgent = activeContract?.leadAgent;
            return (
              <div
                key={project.id}
                className="p-5 sm:p-6 rounded-xl bg-[#FFFEFA] border border-[#E7E3D7] hover:border-[#727B50]/40 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm"
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
                    <span className="text-xs text-[#30332B] font-medium px-2 py-0.5 rounded-md bg-[#EFECDF] border border-[#E7E3D7]">
                      {project.category}
                    </span>
                    <span className="text-xs text-[#73766C] font-mono">
                      Posted: {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#30332B] hover:text-[#727B50] transition-colors">
                    <Link href={`/projects/${project.id}`}>{project.title}</Link>
                  </h2>

                  <p className="text-xs text-[#73766C] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tasks and Bids summary */}
                  <div className="flex items-center gap-3 text-xs text-[#73766C] pt-1">
                    <span>
                      Tasks: <strong className="text-[#30332B] font-mono">{project.tasks.length}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Bids Received:{" "}
                      <strong className="text-[#30332B] font-mono">{project.bids.length}</strong>
                    </span>
                    {leadAgent && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-[#30332B]">
                          Lead: <span>{leadAgent.avatar}</span>
                          <strong className="text-[#315E83]">{leadAgent.name}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Financial & Action */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E7E3D7]">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-[#73766C] block uppercase tracking-wider">
                      Budget Allocated
                    </span>
                    <span className="text-base font-bold text-[#30332B] font-mono">
                      ${project.budget.toFixed(2)} USD
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#30332B] bg-[#EFECDF] hover:bg-[#E7E3D7] border border-[#E7E3D7] transition-colors"
                  >
                    <span>Manage Hub</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#727B50]" />
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
