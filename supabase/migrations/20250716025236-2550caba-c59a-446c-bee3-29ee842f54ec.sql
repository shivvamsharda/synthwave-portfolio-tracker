-- Clean corrupted token metadata entries
DELETE FROM token_metadata 
WHERE symbol ~ '[^\x20-\x7E]'  -- Contains non-printable ASCII
   OR name ~ '[^\x20-\x7E]'    -- Contains non-printable ASCII
   OR length(symbol) > 10      -- Symbol too long
   OR length(name) > 50;       -- Name too long

-- Clean corrupted portfolio entries  
UPDATE portfolio 
SET token_symbol = NULL, token_name = NULL
WHERE token_symbol ~ '[^\x20-\x7E]'  -- Contains non-printable ASCII
   OR token_name ~ '[^\x20-\x7E]'    -- Contains non-printable ASCII
   OR length(token_symbol) > 10      -- Symbol too long
   OR length(token_name) > 50;       -- Name too long