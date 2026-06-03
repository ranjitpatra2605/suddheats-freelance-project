export const metadata = {
    title: 'Refund Policy | ShuddhEats',
};

export default function RefundPolicy() {
    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#fafaf7]">
            <div className="page-container max-w-3xl bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#475d2a] mb-8">Refund Policy</h1>

                <div className="prose prose-emerald max-w-none text-gray-700 space-y-6">
                    <p>
                        At ShuddhEats, our goal is to ensure you always receive products that are fresh, safe, and exactly
                        as promised. Due to the nature of our products (food/perishables), we maintain a strict policy
                        to ensure hygiene and safety.
                    </p>

                    <h2 className="text-xl font-bold text-[#475d2a] mt-8 mb-4">Eligibility for Returns/Replacements:</h2>
                    <ol className="list-decimal pl-5 space-y-3">
                        <li>
                            <strong>Time Frame:</strong> You must raise a request within 7 days from the date of delivery.
                            Requests made after this 7-day window will not be accepted.
                        </li>
                        <li>
                            <strong>Valid Reasons:</strong> We offer replacements or refunds only if the product received is:
                            <ul className="list-[lower-alpha] pl-5 mt-2 space-y-1 text-gray-600">
                                <li>a) Physically Damaged.</li>
                                <li>b) Incorrect Product (wrong item sent compared to what was ordered).</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Non-Returnable Items and reasons:</strong> We do not accept returns or refunds for:
                            <ul className="list-[lower-alpha] pl-5 mt-2 space-y-1 text-gray-600">
                                <li>a. Opened or used products.</li>
                                <li>b. Non-availability of the recipient at the provided address.</li>
                                <li>c. Issues related to change of mind or personal taste preferences.</li>
                                <li>d. Events outside our control (force majeure).</li>
                                <li>e. If the product has been tampered with by the customer.</li>
                            </ul>
                        </li>
                    </ol>

                    <h2 className="text-xl font-bold text-[#475d2a] mt-8 mb-4">How to Request a Return:</h2>
                    <p>To ensure a quick resolution, please follow these steps:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Contact us immediately at <a href="mailto:hello@ShuddhEatsfoods.com" className="text-[#475d2a] font-bold hover:underline">hello@ShuddhEatsfoods.com</a> or <a href="tel:+91 98765 43210" className="text-[#475d2a] font-bold hover:underline">+91 98765 43210</a>.</li>
                        <li>You must provide your order ID and receipt.</li>
                        <li>You must submit clear photos or videos of the product explicitly showing the batch number and manufacturing date, as well as the packaging showing the reported issue.</li>
                    </ol>
                    <p>
                        Once your request is received, our team will verify the details. If the claim is validated, we
                        will process a replacement of the item or a refund, depending on stock availability and your
                        preference.
                    </p>

                    <h2 className="text-xl font-bold text-[#475d2a] mt-8 mb-4">Refunds</h2>
                    <p>Once your refund is accepted by ShuddhEats:</p>
                    <ol className="list-decimal pl-5 space-y-3">
                        <li>
                            <strong>For Prepaid orders:</strong> The refund amount will be reversed to the original payment source,
                            with the amount reflecting within 5-7 working days in your original payment source.
                        </li>
                        <li>
                            <strong>For Cash on Delivery (COD orders):</strong> Refunds for COD orders will be processed via UPI.
                            You must share your valid UPI ID with our team to facilitate this transfer.
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

