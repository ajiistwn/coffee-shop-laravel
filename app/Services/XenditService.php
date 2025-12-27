<?php

namespace App\Services;

use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Illuminate\Support\Facades\Http;

class XenditService
{
    protected $invoiceApi;
    protected $secretKey;

    public function __construct()
    {
        Configuration::setXenditKey(env('XENDIT_API_KEY'));
        $this->invoiceApi = new InvoiceApi();
        $this->secretKey = env('XENDIT_API_KEY');
    }

    /**
     * Create Xendit Invoice
     */
    public function createInvoice(array $data)
    {
        return $this->invoiceApi->createInvoice($data);
    }

    /**
     * Get invoice by ID
     */
    public function getInvoice($invoiceId)
    {
        return $this->invoiceApi->getInvoiceById($invoiceId);
    }

    public function createQris($data)
    {
        $url = "https://api.xendit.co/qr_codes";

        $response = Http::withBasicAuth($this->secretKey, '')
            ->post($url, [
                'external_id' => $data['external_id'],
                'amount' => $data['amount'],
                'type' => 'DYNAMIC',
                'currency' => 'IDR',
                'channel_code' => 'ID_DANA',
                'callback_url'  => 'https://7a35b9fc5cbb.ngrok-free.app/webhook/xendit/qris',
            ]);

        return $response->json();
    }



}
