import { z } from "zod"

// Auth Validations
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["JOB_SEEKER", "COMPANY"]),
})

// Company Validations
export const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  size: z.string().optional(),
  logo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
})

// Job Seeker Validations
export const jobSeekerProfileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().min(0).optional(),
  education: z.string().optional(),
  bio: z.string().optional(),
  resume: z.string().url("Invalid resume URL").optional().or(z.literal("")),
})

// Job Validations
export const jobSchema = z.object({
  title: z.string().min(3, "Job title is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(10, "Requirements are required"),
  category: z.string().min(2, "Category is required"),
  location: z.string().min(2, "Location is required"),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  applicationFee: z.number().min(100, "Minimum fee is $1.00"),
  guaranteeTerms: z.string().min(20, "Guarantee terms are required"),
  guaranteePeriod: z.number().min(1, "Guarantee period must be at least 1 day"),
  postedFor: z.string().optional(),
})

// Application Validations
export const applicationSchema = z.object({
  coverLetter: z.string().optional(),
})

// Message Validations
export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
})

// Refund Validations
export const refundRequestSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason"),
})

