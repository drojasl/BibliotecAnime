<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\MailUserRegistered;

class SendMailController extends Controller
{
    public static function generateWelcomeMail() {
        return new MailUserRegistered;
    }
}
