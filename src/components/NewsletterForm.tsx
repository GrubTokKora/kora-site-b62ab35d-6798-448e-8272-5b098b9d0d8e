import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { subscribeToNewsletter } from '../newsletter';

type NewsletterFormProps = {
  businessId: string;
};

const NewsletterForm: FC<NewsletterFormProps> = ({ businessId }) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!emailOptIn && !smsOptIn) {
      setStatus('error');
      setMessage('Please select at least one subscription option (Email or SMS).');
      return;
    }

    if (smsOptIn && !phoneNumber) {
      setStatus('error');
      setMessage('Please provide a phone number to subscribe to SMS alerts.');
      return;
    }
    
    if (emailOptIn && !email) {
      setStatus('error');
      setMessage('Please provide an email address to subscribe to email alerts.');
      return;
    }

    const result = await subscribeToNewsletter({
      businessId,
      email: emailOptIn ? email : undefined,
      phoneNumber: smsOptIn ? phoneNumber : undefined,
      emailOptIn,
      smsOptIn,
    });

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Thank you for subscribing!');
      setEmail('');
      setPhoneNumber('');
      setEmailOptIn(false);
      setSmsOptIn(false);
    } else {
      setStatus('error');
      setMessage(result.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="newsletter-form">
      <h3>Join Our Newsletter</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            placeholder="Your Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={status === 'loading'}
          />
        </div>
        <div className="form-group-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
              disabled={status === 'loading'}
            />
            Subscribe to Emails
          </label>
          <label>
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              disabled={status === 'loading'}
            />
            Subscribe to SMS
          </label>
        </div>
        <button type="submit" className="btn" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && <p className={`status-message ${status}`}>{message}</p>}
    </div>
  );
};

export default NewsletterForm;