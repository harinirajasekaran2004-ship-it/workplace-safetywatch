from typing import List, Dict, Any

DEFAULT_SAFETY_RULES: List[Dict[str, Any]] = [
    {
        "id": "RULE-ELEC-01",
        "code": "SAFE-ELEC-101",
        "title": "Exposed Electrical Wiring & Live Components Protection",
        "category": "Electrical",
        "description": "All electrical conductors, wires, and junction boxes must be properly insulated, enclosed in approved conduits, and secured against accidental physical contact or moisture exposure.",
        "standard_reference": "General Electrical Safety Standard Sec 1910.303",
        "default_corrective_action": "De-energize circuit, tag out immediately, and install insulated conduit/protective junction cover."
    },
    {
        "id": "RULE-EXIT-01",
        "code": "SAFE-EXIT-201",
        "title": "Unobstructed Emergency Exit & Egress Corridors",
        "category": "Emergency Exit",
        "description": "Emergency exit routes, fire doors, and corridors must remain continuously free of obstructions, storage pallets, equipment, or debris at all times.",
        "standard_reference": "Life Safety & Egress Standard Sec 1910.36",
        "default_corrective_action": "Immediately clear all materials blocking exit pathways and mark 36-inch minimum clearance zone."
    },
    {
        "id": "RULE-PPE-01",
        "code": "SAFE-PPE-301",
        "title": "Mandatory Personal Protective Equipment Compliance",
        "category": "PPE",
        "description": "Employees and site visitors entering designated operational zones must wear required PPE (hard hats, eye protection, safety boots, high-visibility vests, or respirator).",
        "standard_reference": "Personal Protective Equipment Standard Sec 1910.132",
        "default_corrective_action": "Halt unprotected work, supply required certified PPE, and conduct PPE compliance refresher."
    },
    {
        "id": "RULE-SLIP-01",
        "code": "SAFE-SLIP-401",
        "title": "Walking-Working Surfaces & Immediate Spill Remediation",
        "category": "Slip/Trip",
        "description": "Floors, passageways, and stairs must be maintained clean, dry, and free from slip hazards (oil, water, grease) or trip hazards (trailing cords, loose tiles).",
        "standard_reference": "Walking-Working Surfaces Standard Sec 1910.22",
        "default_corrective_action": "Erect caution wet floor signs, deploy absorbent material or mop immediately, and eliminate liquid source."
    },
    {
        "id": "RULE-MACH-01",
        "code": "SAFE-MACH-501",
        "title": "Machine Guarding & Point of Operation Protection",
        "category": "Machinery",
        "description": "Power-driven machines, rotating shafts, nip points, and cutting edges must have fixed or interlocked physical guards to prevent operator limb entrapment.",
        "standard_reference": "Machinery and Machine Guarding Standard Sec 1910.212",
        "default_corrective_action": "Cease machine operation, perform Lockout/Tagout (LOTO), and install/secure certified protective guard barrier."
    },
    {
        "id": "RULE-CHEM-01",
        "code": "SAFE-CHEM-601",
        "title": "Hazardous Chemical Labeling & Storage Containment",
        "category": "Chemical",
        "description": "All chemical containers must possess legible GHS safety labels, SDS sheets accessible nearby, and secondary spill containment in approved flammables cabinets.",
        "standard_reference": "Hazard Communication Standard Sec 1910.1200",
        "default_corrective_action": "Relocate chemical to ventilated secondary containment, apply compliant GHS label, and verify SDS availability."
    },
    {
        "id": "RULE-FIRE-01",
        "code": "SAFE-FIRE-701",
        "title": "Fire Extinguisher & Suppression Equipment Access",
        "category": "Fire",
        "description": "Portable fire extinguishers, hose stations, and sprinkler heads must maintain a minimum 36-inch clear unobstructed radius and up-to-date inspection tags.",
        "standard_reference": "Fire Protection & Suppression Standard Sec 1910.157",
        "default_corrective_action": "Remove obstructions within 36 inches of fire fighting equipment and verify monthly inspection pin seal."
    },
    {
        "id": "RULE-STRUC-01",
        "code": "SAFE-STRUC-801",
        "title": "Storage Rack Structural Integrity & Load Rating",
        "category": "Structural",
        "description": "Heavy industrial pallet racking, mezzanine floors, and shelving must display rated load limits, have secure anchor bolts, and have undamaged upright beams.",
        "standard_reference": "Materials Handling and Storage Standard Sec 1910.176",
        "default_corrective_action": "Unload overloaded or damaged shelf tier, cordon off the bay, and perform structural repair before reloading."
    },
    {
        "id": "RULE-HOUSE-01",
        "code": "SAFE-HOUSE-901",
        "title": "General Housekeeping, Waste Disposal & Aisle Clearance",
        "category": "Housekeeping",
        "description": "Workplaces, storerooms, and service rooms must be kept clean, orderly, and sanitary. Combustible scrap and packing debris must be disposed of promptly.",
        "standard_reference": "Housekeeping & Environmental Sanitation Standard Sec 1910.141",
        "default_corrective_action": "Clear clutter, dispose of combustible packing waste in designated metal bins, and establish daily cleaning log."
    },
    {
        "id": "RULE-EQUIP-01",
        "code": "SAFE-EQUIP-1001",
        "title": "Damaged Tools & Defective Equipment Tag-out",
        "category": "Machinery",
        "description": "Hand tools, power tools, ladders, or handling equipment found cracked, frayed, or structurally compromised must be tagged out of service immediately.",
        "standard_reference": "Hand and Portable Powered Tools Standard Sec 1910.242",
        "default_corrective_action": "Affix 'DANGER - DO NOT OPERATE' tag, remove from shop floor, and send for certified repair or replacement."
    },
    {
        "id": "RULE-FALL-01",
        "code": "SAFE-FALL-1101",
        "title": "Fall Protection & Guardrails for Elevated Platforms",
        "category": "Structural",
        "description": "Every open-sided floor or platform 4 feet or more above adjacent floor ground level must be guarded by a standard rail (top rail, midrail, toeboard).",
        "standard_reference": "Duty to Have Fall Protection Standard Sec 1910.28",
        "default_corrective_action": "Install compliant standard top and mid-rail barrier system or tether personnel with certified fall arrest harness."
    },
    {
        "id": "RULE-GEN-01",
        "code": "SAFE-GEN-1201",
        "title": "General Workplace Safety & First Aid Preparedness",
        "category": "Other",
        "description": "Adequate first aid supplies, eyewash stations, and emergency contact numbers must be readily accessible in every active work quadrant.",
        "standard_reference": "Medical Services and First Aid Standard Sec 1910.151",
        "default_corrective_action": "Replenish missing first-aid kit supplies and test eyewash station flushing mechanism."
    }
]
