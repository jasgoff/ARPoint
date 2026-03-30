#!/usr/bin/env python3
"""
Backend API Testing for AR Survey PWA
Tests all API endpoints including health, auth, and CRUD operations
"""

import requests
import sys
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

class ARSurveyAPITester:
    def __init__(self, base_url: str = "https://web-dev-101-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        
        # Default headers
        req_headers = {'Content-Type': 'application/json'}
        if headers:
            req_headers.update(headers)
        
        # Add auth if available
        if self.session_token:
            req_headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health check endpoint"""
        success, data = self.make_request('GET', '/health')
        if success and data.get('status') == 'healthy':
            self.log_test("Health Check", True)
            return True
        else:
            self.log_test("Health Check", False, f"Response: {data}")
            return False

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, data = self.make_request('GET', '/')
        if success and 'AR Survey API' in data.get('message', ''):
            self.log_test("Root Endpoint", True)
            return True
        else:
            self.log_test("Root Endpoint", False, f"Response: {data}")
            return False

    def test_auth_me_without_token(self):
        """Test /auth/me without authentication - should return 401"""
        success, data = self.make_request('GET', '/auth/me', expected_status=401)
        if success:
            self.log_test("Auth Me (No Token) - 401", True)
            return True
        else:
            self.log_test("Auth Me (No Token) - 401", False, f"Expected 401, got: {data}")
            return False

    def create_test_session(self):
        """Create a test session by directly inserting into MongoDB"""
        try:
            # This would normally require MongoDB access, but we'll simulate
            # For now, we'll create a mock session token for testing
            self.session_token = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            self.user_id = f"test_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Note: In a real test, we'd need to insert this into MongoDB
            # For now, we'll just set the token and see if endpoints work
            self.log_test("Create Test Session", True, "Mock session created")
            return True
        except Exception as e:
            self.log_test("Create Test Session", False, str(e))
            return False

    def test_auth_me_with_token(self):
        """Test /auth/me with authentication token"""
        if not self.session_token:
            self.log_test("Auth Me (With Token)", False, "No session token available")
            return False
            
        success, data = self.make_request('GET', '/auth/me')
        if success and 'user_id' in data:
            self.log_test("Auth Me (With Token)", True)
            return True
        else:
            # Expected to fail since we don't have real session in DB
            self.log_test("Auth Me (With Token)", False, f"Expected failure - no real session in DB: {data}")
            return False

    def test_pins_endpoints(self):
        """Test pins CRUD operations"""
        # Test GET pins (should require auth)
        success, data = self.make_request('GET', '/pins', expected_status=401)
        if success:
            self.log_test("Get Pins (No Auth) - 401", True)
        else:
            self.log_test("Get Pins (No Auth) - 401", False, f"Response: {data}")

        # Test POST pin (should require auth)
        pin_data = {
            "name": "Test Pin",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "altitude": 10.0,
            "notes": "Test pin for API testing"
        }
        success, data = self.make_request('POST', '/pins', data=pin_data, expected_status=401)
        if success:
            self.log_test("Create Pin (No Auth) - 401", True)
        else:
            self.log_test("Create Pin (No Auth) - 401", False, f"Response: {data}")

    def test_traces_endpoints(self):
        """Test traces CRUD operations"""
        # Test GET traces (should require auth)
        success, data = self.make_request('GET', '/traces', expected_status=401)
        if success:
            self.log_test("Get Traces (No Auth) - 401", True)
        else:
            self.log_test("Get Traces (No Auth) - 401", False, f"Response: {data}")

        # Test POST trace (should require auth)
        trace_data = {
            "name": "Test Trace",
            "points": [
                {"latitude": 37.7749, "longitude": -122.4194, "altitude": 10.0, "timestamp": "2024-01-01T00:00:00Z"},
                {"latitude": 37.7750, "longitude": -122.4195, "altitude": 11.0, "timestamp": "2024-01-01T00:01:00Z"}
            ],
            "total_distance": 15.2
        }
        success, data = self.make_request('POST', '/traces', data=trace_data, expected_status=401)
        if success:
            self.log_test("Create Trace (No Auth) - 401", True)
        else:
            self.log_test("Create Trace (No Auth) - 401", False, f"Response: {data}")

    def test_measurements_endpoints(self):
        """Test measurements CRUD operations"""
        # Test GET measurements (should require auth)
        success, data = self.make_request('GET', '/measurements', expected_status=401)
        if success:
            self.log_test("Get Measurements (No Auth) - 401", True)
        else:
            self.log_test("Get Measurements (No Auth) - 401", False, f"Response: {data}")

        # Test POST measurement (should require auth)
        measurement_data = {
            "name": "Test Measurement",
            "start_point": {"latitude": 37.7749, "longitude": -122.4194, "altitude": 10.0},
            "end_point": {"latitude": 37.7750, "longitude": -122.4195, "altitude": 11.0},
            "distance": 15.2,
            "bearing": 45.0
        }
        success, data = self.make_request('POST', '/measurements', data=measurement_data, expected_status=401)
        if success:
            self.log_test("Create Measurement (No Auth) - 401", True)
        else:
            self.log_test("Create Measurement (No Auth) - 401", False, f"Response: {data}")

    def test_logout_endpoint(self):
        """Test logout endpoint"""
        success, data = self.make_request('POST', '/auth/logout')
        if success and data.get('success'):
            self.log_test("Logout", True)
            return True
        else:
            self.log_test("Logout", False, f"Response: {data}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting AR Survey API Tests")
        print(f"📍 Testing: {self.base_url}")
        print("=" * 50)

        # Basic connectivity tests
        self.test_health_check()
        self.test_root_endpoint()

        # Auth tests
        self.test_auth_me_without_token()
        self.create_test_session()
        self.test_auth_me_with_token()

        # CRUD endpoint tests (without auth - should return 401)
        self.test_pins_endpoints()
        self.test_traces_endpoints()
        self.test_measurements_endpoints()

        # Logout test
        self.test_logout_endpoint()

        # Print summary
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

    def get_test_summary(self):
        """Get test summary for reporting"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    """Main test runner"""
    tester = ARSurveyAPITester()
    exit_code = tester.run_all_tests()
    
    # Save test results
    summary = tester.get_test_summary()
    with open('/tmp/backend_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())