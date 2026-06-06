import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    // In a production app, this would be heavily protected by auth and roles.
    
    // Execute the prisma seed script to reset the database
    const { stdout, stderr } = await execAsync("npx tsx prisma/seed.ts", {
      cwd: process.cwd() // Ensure it runs in the Next.js root
    });
    
    if (stderr && !stderr.includes("warn")) {
      console.warn("Seed stderr:", stderr);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Database has been reset to original demo data." 
    });

  } catch (error: any) {
    console.error("Reset API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset database" }, { status: 500 });
  }
}
