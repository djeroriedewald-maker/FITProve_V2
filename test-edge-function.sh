#!/bin/bash
# Quick test of the Edge Function

echo "🧪 Testing Edge Function..."
echo ""

curl -X POST "https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ If you see a 200 status and success:true, the Edge Function is working!"
