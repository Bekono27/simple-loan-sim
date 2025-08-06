-- Add sample bank statement data to existing loan applications for testing
UPDATE loan_applications 
SET 
  bank_statement_filename = 'golomt_bank_statement_2024_12.pdf',
  bank_statement_url = 'sample_statements/golomt_statement_user1.pdf'
WHERE user_id = '2a4dd269-dd94-4d64-8663-062469d07286' 
AND id = '6c80ca51-0f3a-4388-b8fb-701411cb357b';

UPDATE loan_applications 
SET 
  bank_statement_filename = 'khan_bank_statement_2024_11.pdf',
  bank_statement_url = 'sample_statements/khan_statement_user2.pdf'
WHERE user_id = 'f597a29a-185d-491f-a166-a2d6ba6df587' 
AND id = '9f8c6370-29ea-4477-884d-f8f7af06a240';

UPDATE loan_applications 
SET 
  bank_statement_filename = 'tdb_bank_statement_2024_10.pdf',
  bank_statement_url = 'sample_statements/tdb_statement_user3.pdf'
WHERE user_id = '0ebabe30-df26-4e11-9336-148f1a6e20a4' 
AND id = '2a10eb95-e2e2-4ed9-96aa-feccd519fe97';

-- Add one more recent loan application with bank statement
INSERT INTO loan_applications (
  user_id,
  amount,
  status,
  bank_statement_filename,
  bank_statement_url,
  eligibility_result,
  created_at
) VALUES (
  '2a4dd269-dd94-4d64-8663-062469d07286',
  1500000,
  'approved',
  'state_bank_statement_january_2025.pdf',
  'sample_statements/state_bank_statement_jan2025.pdf',
  'Зээлийн боломж өндөр. Банкны хуулга баталгаажлаа.',
  NOW()
);

-- Add another user's loan with bank statement
INSERT INTO loan_applications (
  user_id,
  amount,
  status,
  bank_statement_filename,
  bank_statement_url,
  eligibility_result,
  max_loan_amount,
  interest_rate,
  created_at
) VALUES (
  'f597a29a-185d-491f-a166-a2d6ba6df587',
  800000,
  'pending',
  'capitron_bank_december_2024.pdf',
  'sample_statements/capitron_dec2024.pdf',
  'Шинжилгээ хийгдэж байна. Банкны баримт хүлээн авлаа.',
  NULL,
  NULL,
  NOW() - INTERVAL '2 days'
);