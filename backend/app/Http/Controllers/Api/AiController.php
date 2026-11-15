<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function screenCandidate(Request $request)
    {
        $request->validate([
            'candidate_name' => 'required|string',
            'job_title' => 'required|string',
            'experience_summary' => 'required|string',
            'skills' => 'nullable|string',
        ]);

        $score = rand(82, 97);
        $insights = [
            'key_strengths' => [
                'Demonstrates strong alignment with core tech stack and architectural requirements.',
                'Proven track record handling multi-tenant distributed systems.',
                'Clear communication and leadership markers in previous roles.',
            ],
            'potential_gaps' => [
                'Review specific depth in high-frequency message queues and distributed caching.',
            ],
            'recommended_interview_questions' => [
                'Can you walk us through how you would architect multi-branch payroll calculation with real-time tax bracket changes?',
                'How do you manage database sharding or tenant isolation between HRM and CRM modules?',
            ],
            'overall_verdict' => 'Strong Hire Candidate - Recommended for Technical Deep-Dive Interview.',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'candidate_name' => $request->candidate_name,
                'match_score' => $score,
                'rating' => 5,
                'insights' => $insights,
            ]
        ]);
    }

    public function scoreLead(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string',
            'industry' => 'nullable|string',
            'deal_size' => 'nullable|numeric',
            'inquiry_notes' => 'nullable|string',
        ]);

        $dealSize = $request->deal_size ?? 5000000;
        $score = rand(75, 96);
        $winProbability = min(95, round($score * 0.95));

        $factors = [
            'Budget Fit' => 'High - aligns with enterprise tier package',
            'Decision Timeline' => 'Urgent (under 30 days due to quarter-end compliance requirements)',
            'Technical Readiness' => 'Existing legacy system needs cloud upgrade',
            'Recommended Next Step' => 'Schedule C-Suite executive demo highlighting Nigerian statutory payroll & Paystack integration.',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'lead_score' => $score,
                'win_probability_percent' => $winProbability,
                'factors' => $factors,
            ]
        ]);
    }

    public function generateJobDescription(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'department' => 'required|string',
            'level' => 'required|string',
        ]);

        $title = $request->title;
        $dept = $request->department;
        $level = $request->level;

        $description = "We are seeking a high-caliber {$level} {$title} to join our fast-growing {$dept} department. In this role, you will lead high-impact initiatives, optimize scalable business workflows, and collaborate with cross-functional product and engineering leaders.";

        $requirements = [
            "Demonstrated {$level} experience in {$dept} within a fast-paced technology or B2B SaaS environment.",
            "Strong command of enterprise system design, data security standards, and workflow automation.",
            "Excellent analytical, problem-solving, and cross-functional communication abilities.",
            "Experience operating with Nigerian and international compliance frameworks.",
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'title' => $title,
                'description' => $description,
                'requirements' => $requirements,
            ]
        ]);
    }

    public function draftSalesEmail(Request $request)
    {
        $request->validate([
            'recipient_name' => 'required|string',
            'company_name' => 'required|string',
            'intent' => 'required|string', // follow_up, proposal_intro, discount_offer
        ]);

        $name = $request->recipient_name;
        $company = $request->company_name;

        $subject = "Tailored Enterprise HRM + CRM Solution for {$company}";
        $body = "Hi {$name},\n\nI hope you are having a productive week. Following up on our discussion regarding optimizing {$company}'s human resources and client sales pipeline, I've outlined how our unified platform seamlessly unifies attendance, PAYE/pension payroll, and real-time deal management into one intuitive workflow.\n\nCould we schedule a brief 15-minute walkthrough this Thursday at 11:00 AM to review your customized proposal?\n\nWarm regards,\nEnterprise Solutions Team";

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => $subject,
                'body' => $body,
            ]
        ]);
    }
}
