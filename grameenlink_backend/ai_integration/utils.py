import os
import json
import logging
import requests
import re
from datetime import datetime

logger = logging.getLogger(__name__)

class GeminiAI:
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    
    def __init__(self, model="gemini-2.0-flash"):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        self.model = model
    
    def _get_api_url(self):
        return f"{self.BASE_URL}/{self.model}:generateContent"
    
    def generate_content(self, prompt, max_tokens=2048, temperature=0.7):
        headers = {
            'Content-Type': 'application/json',
        }
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }
        
        try:
            url = f"{self._get_api_url()}?key={self.api_key}"
            logger.debug(f"Making request to: {self._get_api_url()}")
            
            response = requests.post(
                url,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return self._parse_response(response.json())
        except requests.exceptions.RequestException as e:
            logger.error(f"API Request failed: {str(e)}")
            # Include more detailed error information
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response text: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise

    def _parse_response(self, response):
        try:
            if not response.get('candidates'):
                error_info = response.get('error', {})
                error_message = error_info.get('message', 'Unknown error')
                error_code = error_info.get('code', 'UNKNOWN')
                raise ValueError(f"No candidates in AI response. Error: {error_code} - {error_message}")
            
            candidate = response['candidates'][0]
            
            # Handle response structure for v1beta
            content = ""
            if 'content' in candidate and 'parts' in candidate['content']:
                for part in candidate['content']['parts']:
                    if 'text' in part:
                        content += part['text']
            
            # If content is still empty, try older format
            if not content and 'text' in candidate.get('content', {}).get('parts', [{}])[0]:
                content = candidate['content']['parts'][0]['text']
                
            if not content:
                raise ValueError("Could not extract text content from response")
            
            return {
                'content': content,
                'safety_ratings': candidate.get('safetyRatings', []),
                'citation_metadata': candidate.get('citationMetadata'),
                'raw_response': response,
                'timestamp': datetime.now().isoformat()
            }
        except KeyError as e:
            logger.error(f"Malformed API response: {str(e)}")
            logger.error(f"Response structure: {json.dumps(response, indent=2)}")
            raise ValueError(f"Invalid API response format: {str(e)}")
        except Exception as e:
            logger.error(f"Error parsing response: {str(e)}")
            raise

class AIResponseParser:
    @staticmethod
    def parse_to_json(text_response):
        """Enhanced robust parsing with advanced error handling and structure recognition"""
        try:
            # Clean and normalize the response
            cleaned = text_response.strip()
            
            # Step 1: Try to extract properly formatted JSON blocks
            json_content = AIResponseParser._extract_json_content(cleaned)
            if json_content:
                try:
                    return json.loads(json_content)
                except json.JSONDecodeError:
                    # Continue with other methods if this fails
                    pass
            
            # Step 2: Try to fix common JSON formatting issues
            fixed_json = AIResponseParser._fix_json_formatting(cleaned)
            if fixed_json:
                try:
                    return json.loads(fixed_json)
                except json.JSONDecodeError:
                    # Continue with other methods if this fails
                    pass
            
            # Step 3: Try natural text parsing as a last resort
            return AIResponseParser._structure_text_response(cleaned)
            
        except Exception as e:
            logger.error(f"Parse error: {str(e)}")
            return {
                "raw_output": text_response, 
                "error": str(e),
                "parsing_note": "Failed to parse as JSON. Consider checking the prompt to ensure it generates properly formatted JSON."
            }

    @staticmethod
    def _extract_json_content(text):
        """Extract JSON content from text with various delimiters"""
        # Common JSON block patterns
        patterns = [
            r'```json\n(.*?)```',  # Markdown JSON code blocks
            r'```(.*?)```',        # Any markdown code blocks
            r'`(.*?)`',            # Inline code blocks
            r'{.*}',               # Any JSON-like text
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            for match in matches:
                # Try to validate as JSON
                try:
                    # Clean up the match
                    clean_match = match.strip()
                    # Ensure it's a JSON object
                    if clean_match.startswith('{') and clean_match.endswith('}'):
                        # Validate by parsing
                        json.loads(clean_match)
                        return clean_match
                except json.JSONDecodeError:
                    continue
        
        return None

    @staticmethod
    def _fix_json_formatting(text):
        """Fix common JSON formatting issues"""
        # Extract what looks like JSON content
        json_like_content = None
        
        # Look for content between curly braces
        match = re.search(r'({.*})', text, re.DOTALL)
        if match:
            json_like_content = match.group(1)
        else:
            # Just use the whole text
            json_like_content = text
        
        if not json_like_content:
            return None
        
        # Fix common issues
        fixed_text = json_like_content
        
        # Replace smart quotes with straight quotes
        fixed_text = fixed_text.replace('"', '"').replace('"', '"')
        
        # Fix missing quotes around keys
        fixed_text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', fixed_text)
        
        # Fix trailing commas in arrays/objects
        fixed_text = re.sub(r',(\s*[}\]])', r'\1', fixed_text)
        
        # Fix missing commas between array items or object properties
        fixed_text = re.sub(r'(["\d])\s*\n\s*(["{[])', r'\1,\n\2', fixed_text)
        
        # Fix unquoted string values
        fixed_text = re.sub(r':\s*([^"{}\[\],\s][^,}\]]*?)(\s*[,}\]])', r': "\1"\2', fixed_text)
        
        # Fix unbalanced brackets by adding missing closing brackets
        open_curly = fixed_text.count('{')
        close_curly = fixed_text.count('}')
        open_square = fixed_text.count('[')
        close_square = fixed_text.count(']')
        
        if open_curly > close_curly:
            fixed_text += "}" * (open_curly - close_curly)
        if open_square > close_square:
            fixed_text += "]" * (open_square - close_square)
        
        # Try to parse the fixed JSON to validate
        try:
            json.loads(fixed_text)
            return fixed_text
        except json.JSONDecodeError:
            # If still invalid, return None
            return None

    @staticmethod
    def _structure_text_response(text):
        """Advanced text structuring with intelligent section detection"""
        result = {}
        
        # Split into sections using multiple heuristics
        sections = AIResponseParser._identify_sections(text)
        
        for section_name, section_content in sections.items():
            # Process list items
            if isinstance(section_content, str):
                # Check if this is a list
                lines = [line.strip() for line in section_content.split('\n') if line.strip()]
                list_markers = ['-', '•', '*', '1.', '2.', '3.']
                
                is_list = len(lines) > 0 and any(
                    any(line.startswith(marker + ' ') for marker in list_markers)
                    for line in lines
                )
                
                if is_list:
                    list_items = []
                    current_item = []
                    
                    for line in lines:
                        if any(line.startswith(marker + ' ') for marker in list_markers):
                            # Save previous item if exists
                            if current_item:
                                list_items.append(' '.join(current_item))
                                current_item = []
                            
                            # Start new item (remove the marker)
                            for marker in list_markers:
                                if line.startswith(marker + ' '):
                                    current_item.append(line[len(marker) + 1:])
                                    break
                        else:
                            # Continue previous item
                            current_item.append(line)
                    
                    # Add the last item
                    if current_item:
                        list_items.append(' '.join(current_item))
                    
                    result[section_name] = list_items
                else:
                    result[section_name] = section_content
            else:
                result[section_name] = section_content
        
        # If no sections were found, just return the content
        if not result:
            result["content"] = text
            
        return result

    @staticmethod
    def _identify_sections(text):
        """Identify sections in the text using multiple patterns"""
        sections = {}
        lines = text.split('\n')
        
        # Collect potential section headers
        potential_headers = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            # Case 1: Line ends with colon and is not too long
            if line.endswith(':') and len(line) < 50:
                potential_headers.append((i, line[:-1].lower().replace(' ', '_')))
                
            # Case 2: Line follows header-like patterns (all caps, hash prefixes)
            elif line.isupper() or line.startswith('#'):
                potential_headers.append((i, line.lower().replace(' ', '_').replace('#', '')))
                
            # Case 3: Line follows "Key: Value" format with short key
            elif ':' in line and line.index(':') < 20:
                key = line[:line.index(':')].strip().lower().replace(' ', '_')
                potential_headers.append((i, key))
        
        # Process identified headers and extract content
        if potential_headers:
            for j, (header_idx, header_name) in enumerate(potential_headers):
                # Determine section content range
                start_line = header_idx + 1
                end_line = len(lines)
                
                if j < len(potential_headers) - 1:
                    end_line = potential_headers[j + 1][0]
                
                # Extract content
                content_lines = lines[start_line:end_line]
                content = '\n'.join(content_lines).strip()
                
                # Clean header name
                clean_header = header_name.strip('_').replace('__', '_')
                
                # Add to sections
                sections[clean_header] = content
        else:
            # No clear sections found, use default "content" section
            sections["content"] = text
            
        return sections


class AIOutputNormalizer:
    @staticmethod
    def normalize_json_structure(data):
        """Normalize JSON structure by fixing common issues in AI outputs"""
        if not isinstance(data, dict):
            return data
        
        normalized = {}
        
        # Process keys and values
        for key, value in data.items():
            # Clean key (remove quotes and special chars)
            clean_key = key.strip('"\'').strip()
            clean_key = re.sub(r'[^a-zA-Z0-9_]', '_', clean_key)
            clean_key = clean_key.lower()
            
            # Normalize value based on type
            if isinstance(value, list):
                # Clean list items
                clean_list = []
                for item in value:
                    if isinstance(item, str):
                        # Remove bullet points and clean whitespace
                        clean_item = re.sub(r'^[•\-*]\s*', '', item)
                        clean_item = clean_item.strip()
                        if clean_item:
                            clean_list.append(clean_item)
                    elif isinstance(item, (dict, list)):
                        # Recursively normalize nested structures
                        clean_list.append(AIOutputNormalizer.normalize_json_structure(item))
                    else:
                        clean_list.append(item)
                normalized[clean_key] = clean_list
            elif isinstance(value, dict):
                # Recursively normalize nested objects
                normalized[clean_key] = AIOutputNormalizer.normalize_json_structure(value)
            elif isinstance(value, str):
                # Clean string values
                clean_value = value.strip()
                # Convert string representation of arrays to actual arrays
                if clean_value.startswith('[') and clean_value.endswith(']'):
                    try:
                        # Attempt to parse as JSON array
                        array_value = json.loads(clean_value)
                        normalized[clean_key] = array_value
                    except json.JSONDecodeError:
                        # If parsing fails, keep as string
                        normalized[clean_key] = clean_value
                else:
                    normalized[clean_key] = clean_value
            else:
                normalized[clean_key] = value
        
        return normalized


def parse_ai_response(response_text):
    """Complete AI response parsing pipeline"""
    try:
        # Step 1: Initial parsing
        parser = AIResponseParser()
        parsed_data = parser.parse_to_json(response_text)
        
        # Step 2: Structure normalization
        normalized_data = AIOutputNormalizer.normalize_json_structure(parsed_data)
        
        return {
            "success": True,
            "data": normalized_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to parse AI response: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "raw_text": response_text,
            "timestamp": datetime.now().isoformat()
        }