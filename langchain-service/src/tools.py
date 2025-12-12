"""
LangChain Tools for Voice Agents
Define custom tools that agents can use during conversations.
"""

from typing import Optional
from datetime import datetime
from langchain_core.tools import tool


# ==================== General Tools ====================

@tool
def get_current_time() -> str:
    """Get the current date and time."""
    now = datetime.now()
    return now.strftime("%A, %B %d, %Y at %I:%M %p")


@tool
def calculate(expression: str) -> str:
    """
    Perform a mathematical calculation.
    
    Args:
        expression: A mathematical expression to evaluate (e.g., "2 + 2", "100 * 0.15")
    """
    try:
        # Safe evaluation of mathematical expressions
        allowed_chars = set("0123456789+-*/.() ")
        if not all(c in allowed_chars for c in expression):
            return "Error: Invalid characters in expression"
        
        result = eval(expression)
        return f"The result of {expression} is {result}"
    except Exception as e:
        return f"Error calculating: {str(e)}"


# ==================== Customer Support Tools ====================

@tool
def check_order_status(order_id: str) -> str:
    """
    Check the status of a customer order.
    
    Args:
        order_id: The order ID to look up
    """
    # In production, this would call your order system
    # This is a mock implementation
    statuses = {
        "12345": "Your order is out for delivery and should arrive today.",
        "12346": "Your order is being prepared and will ship tomorrow.",
        "12347": "Your order has been delivered.",
    }
    return statuses.get(
        order_id,
        f"I couldn't find an order with ID {order_id}. Please verify the order number."
    )


@tool
def create_support_ticket(
    issue_type: str,
    description: str,
    priority: str = "normal"
) -> str:
    """
    Create a support ticket for the customer.
    
    Args:
        issue_type: Type of issue (billing, technical, general)
        description: Description of the issue
        priority: Priority level (low, normal, high)
    """
    # In production, this would create a ticket in your system
    ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    return f"I've created support ticket {ticket_id} for your {issue_type} issue. Our team will contact you within 24 hours."


# ==================== Sales Tools ====================

@tool
def check_product_availability(product_name: str) -> str:
    """
    Check if a product is available in stock.
    
    Args:
        product_name: Name of the product to check
    """
    # Mock implementation
    return f"Yes, {product_name} is currently in stock. Would you like me to tell you more about it?"


@tool
def get_pricing(product_name: str) -> str:
    """
    Get pricing information for a product.
    
    Args:
        product_name: Name of the product
    """
    # Mock implementation
    return f"The {product_name} starts at $99. We also have premium options available. Would you like more details?"


@tool
def schedule_demo(
    name: str,
    email: str,
    preferred_time: str
) -> str:
    """
    Schedule a product demo for a potential customer.
    
    Args:
        name: Customer's name
        email: Customer's email address
        preferred_time: Preferred demo time
    """
    return f"I've scheduled a demo for {name} at {preferred_time}. A confirmation will be sent to {email}."


# ==================== Healthcare Tools ====================

@tool
def check_appointment_availability(
    date: str,
    doctor_type: str = "general"
) -> str:
    """
    Check available appointment slots.
    
    Args:
        date: Preferred date (e.g., "tomorrow", "next Monday")
        doctor_type: Type of doctor (general, specialist)
    """
    # Mock implementation
    return f"We have openings on {date} at 9:00 AM, 2:00 PM, and 4:30 PM. Would any of these times work for you?"


@tool
def book_appointment(
    patient_name: str,
    date: str,
    time: str,
    reason: str
) -> str:
    """
    Book a medical appointment.
    
    Args:
        patient_name: Patient's full name
        date: Appointment date
        time: Appointment time
        reason: Reason for visit
    """
    return f"I've booked an appointment for {patient_name} on {date} at {time}. Please arrive 15 minutes early."


# ==================== Restaurant Tools ====================

@tool
def check_reservation_availability(
    date: str,
    time: str,
    party_size: int
) -> str:
    """
    Check if a reservation slot is available.
    
    Args:
        date: Desired date
        time: Desired time
        party_size: Number of guests
    """
    return f"We have availability for a party of {party_size} on {date} at {time}. Would you like me to book it?"


@tool
def make_reservation(
    name: str,
    date: str,
    time: str,
    party_size: int,
    special_requests: Optional[str] = None
) -> str:
    """
    Make a restaurant reservation.
    
    Args:
        name: Name for the reservation
        date: Reservation date
        time: Reservation time
        party_size: Number of guests
        special_requests: Any special requests (dietary, seating, etc.)
    """
    reservation = f"Reservation confirmed for {name}, party of {party_size}, on {date} at {time}."
    if special_requests:
        reservation += f" I've noted your request: {special_requests}."
    return reservation


@tool
def get_menu_info(category: Optional[str] = None) -> str:
    """
    Get information about the menu.
    
    Args:
        category: Menu category (appetizers, entrees, desserts, drinks) or None for overview
    """
    if category:
        return f"Our {category} include a variety of delicious options. Would you like me to describe some specific items?"
    return "We offer appetizers, entrees, desserts, and a full bar. What category would you like to hear about?"


# ==================== Tool Registry ====================

AVAILABLE_TOOLS = {
    # General
    "get_current_time": get_current_time,
    "calculate": calculate,
    
    # Customer Support
    "check_order_status": check_order_status,
    "create_support_ticket": create_support_ticket,
    
    # Sales
    "check_product_availability": check_product_availability,
    "get_pricing": get_pricing,
    "schedule_demo": schedule_demo,
    
    # Healthcare
    "check_appointment_availability": check_appointment_availability,
    "book_appointment": book_appointment,
    
    # Restaurant
    "check_reservation_availability": check_reservation_availability,
    "make_reservation": make_reservation,
    "get_menu_info": get_menu_info,
}

# Tool sets by industry
INDUSTRY_TOOLS = {
    "customer-support": ["get_current_time", "check_order_status", "create_support_ticket"],
    "sales": ["get_current_time", "check_product_availability", "get_pricing", "schedule_demo"],
    "healthcare": ["get_current_time", "check_appointment_availability", "book_appointment"],
    "restaurant": ["get_current_time", "check_reservation_availability", "make_reservation", "get_menu_info"],
}


def get_tools(tool_names: list[str]) -> list:
    """Get tool instances by name."""
    return [AVAILABLE_TOOLS[name] for name in tool_names if name in AVAILABLE_TOOLS]


def get_tools_for_industry(industry_slug: str) -> list:
    """Get tools appropriate for an industry."""
    tool_names = INDUSTRY_TOOLS.get(industry_slug, ["get_current_time"])
    return get_tools(tool_names)

