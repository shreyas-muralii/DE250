import uuid

from django.core.management.base import BaseCommand

from productinfo.models import ProductInfo


PRODUCTS = [
    {
        "id": uuid.UUID("b70682e1-92ed-4185-a6a8-0d37e84f1cc7"),
        "name": "Everyday cotton overshirt",
        "brand": "Common Thread Studio",
        "description": "A roomy, mid-weight overshirt designed for repeat wear and easy layering. This is an illustrative course prototype record; supplier and workshop details are fictional.",
        "category": "Overshirt",
        "materials": ["Cotton"],
        "features": ["Mid-weight", "Layering", "Easy button repair"],
        "store_location": {"zone": "Shirts & layers", "rack": "A1", "x": 24, "y": 42, "directions": "Left wall, first rail from the entrance."},
        "process": {
            "stages": [
                {"title": "Fibre · cotton", "detail": "The concept uses certified organic cotton as its main fibre. In a real passport, the certificate and farm or cooperative would be linked here; this sample does not claim verified certification.", "location": "Illustrative source · India"},
                {"title": "Yarn · spinning", "detail": "The cotton is cleaned, carded and spun into yarn. The proposed supplier record would include the mill name, energy information and a dated invoice or certificate.", "location": "Illustrative mill · Tamil Nadu, India"},
                {"title": "Fabric · weaving", "detail": "The yarn is woven into a sturdy plain-weave cloth. A small swatch and fabric specification would help confirm the weave and fibre composition.", "location": "Illustrative weaving unit · Erode, India"},
                {"title": "Cut & sew", "detail": "Panels are cut to the overshirt pattern and sewn together. The fictional workshop record is included to show the level of disclosure this passport aims for; it is not a real supplier claim.", "location": "Illustrative workshop · Tiruppur, India"},
                {"title": "Finish · ready to wear", "detail": "The garment is checked, folded and prepared for the shop. Packaging and transport are intentionally not assigned an emissions figure because this sample has no verified data.", "location": "Course concept sample"},
            ],
            "tag": {"material": "Recycled paper embedded with a proposed native pollinator seed mix", "planting": "Remove the tag, dampen and cover lightly with soil. Confirm the seed mix is suitable for your region before planting.", "note": "Seed paper is a material choice, not a measured carbon offset. No offset quantity is claimed."},
            "care": "Air between wears; wash cool when needed and repair a loose button before replacing the shirt.",
            "transparency": "Course concept sample. Supplier names and locations are illustrative, not verified product provenance.",
        },
    },
    {
        "id": uuid.UUID("2f232cbf-1a13-4529-b776-8792d82a6980"),
        "name": "Relaxed linen blend shirt",
        "brand": "Common Thread Studio",
        "description": "A light, relaxed shirt imagined for warm days and long use. This is an illustrative course prototype record; the material journey below is a design scenario, not a verified supply chain.",
        "category": "Shirt",
        "materials": ["Linen", "Cotton"],
        "features": ["Lightweight", "Warm-weather", "Relaxed fit"],
        "store_location": {"zone": "Shirts & layers", "rack": "A2", "x": 43, "y": 42, "directions": "Left wall, second rail from the entrance."},
        "process": {
            "stages": [
                {"title": "Fibre · flax & cotton", "detail": "The design scenario combines linen from flax with a smaller cotton share for softness. A real record would state exact percentages and identify the source for each fibre.", "location": "Illustrative fibre sources · Europe and India"},
                {"title": "Yarn · blending", "detail": "Flax and cotton yarns are prepared for a breathable, textured fabric. The blend ratio shown here is a proposal and needs a supplier specification before production.", "location": "Illustrative yarn mill · India"},
                {"title": "Fabric · weaving", "detail": "A light woven cloth is proposed for the shirt body. Fabric weight, dye chemistry and finishing would be added to a verified passport when documentation is available.", "location": "Illustrative weaving unit · India"},
                {"title": "Cut & sew", "detail": "The relaxed pattern is cut with room for movement and sewn with straightforward construction intended to be easier to mend.", "location": "Illustrative workshop · India"},
                {"title": "Finish · ready to wear", "detail": "The shirt is inspected and packed for retail. No water, energy or carbon totals are shown because this concept record has no measured production data.", "location": "Course concept sample"},
            ],
            "tag": {"material": "Recycled paper embedded with a proposed native pollinator seed mix", "planting": "Plant only after checking that the included seed mix is appropriate for your location; follow local planting guidance.", "note": "The seed-paper tag is not presented as a carbon offset. Impact would need independent measurement."},
            "care": "Wash gently and let the natural texture show; mend small seams to extend its life.",
            "transparency": "Course concept sample. Fibre sources, workshop and locations are illustrative and have not been verified.",
        },
    },
    {
        "id": uuid.UUID("fffdda5f-a617-49f9-9fba-6df002adbdcf"),
        "name": "Utility hemp-cotton trousers",
        "brand": "Common Thread Studio",
        "description": "Hard-wearing everyday trousers imagined around durable construction and repairable details. This is an illustrative course prototype record, not a traceable commercial product.",
        "category": "Trousers",
        "materials": ["Hemp", "Cotton"],
        "features": ["Everyday wear", "Repairable details", "Reinforced seams"],
        "store_location": {"zone": "Trousers", "rack": "B1", "x": 74, "y": 57, "directions": "Right side of the central trouser rack."},
        "process": {
            "stages": [
                {"title": "Fibre · hemp & cotton", "detail": "The proposed fabric combines hemp with cotton. The final fibre percentages and any certification would need to be verified against mill documentation.", "location": "Illustrative fibre sources · India"},
                {"title": "Yarn · preparation", "detail": "The fibres are prepared and spun into yarn suited to a denser workwear cloth. This concept does not assume a particular farm, mill or environmental performance result.", "location": "Illustrative mill · India"},
                {"title": "Fabric · weaving", "detail": "A sturdy woven fabric is proposed, with extra reinforcement at stress points. In a real passport, the fabric lot and finishing process would be recorded here.", "location": "Illustrative weaving unit · India"},
                {"title": "Cut & sew", "detail": "The trousers are assembled with reinforced seams and replaceable buttons so common wear points can be repaired rather than discarded.", "location": "Illustrative workshop · India"},
                {"title": "Finish · ready to wear", "detail": "The finished piece is checked before retail. This sample shows no footprint number: there is no verified bill of materials or measured logistics data behind it.", "location": "Course concept sample"},
            ],
            "tag": {"material": "Recycled paper embedded with a proposed native pollinator seed mix", "planting": "Check the seed mix and planting season for your area before planting. Never introduce unfamiliar seeds into sensitive habitats.", "note": "The tag may grow into a plant under suitable conditions; no carbon-offset claim is made."},
            "care": "Spot clean when possible, wash only when needed, and patch or reinforce worn knees.",
            "transparency": "Course concept sample. All supplier and place details are illustrative; no verified impact data is attached.",
        },
    },
]


class Command(BaseCommand):
    help = "Replace product records with three illustrative garment passport samples."

    def handle(self, *args, **options):
        deleted, _ = ProductInfo.objects.all().delete()
        created = [ProductInfo.objects.create(**product) for product in PRODUCTS]
        self.stdout.write(self.style.SUCCESS(
            f"Removed {deleted} previous database record(s) and created {len(created)} illustrative garment passports."
        ))
        for product in created:
            self.stdout.write(f"{product.name}: {product.id}")
