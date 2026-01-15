-- PROCEDURES

-- CREDIT WHITDRAW
-- example CALL sp_credit_withdraw(idaccount, amount);
DELIMITER $$

CREATE PROCEDURE sp_credit_withdraw (
  IN p_idaccount INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_creditlimit DECIMAL(10,2);
  DECLARE v_balance DECIMAL(10,2);
  
  -- checks that added amount is not 0 or negative
  IF p_amount IS NULL OR p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount must be greater than 0';
  END IF;
  
  START TRANSACTION;
  
  -- Locks rows 
  SELECT creditlimit, balance
    INTO v_creditlimit, v_balance
    FROM accounts
  WHERE idaccount = p_idaccount
  FOR UPDATE;
  
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not found';
  END IF;
  
  -- Checks credit
  IF (v_creditlimit - v_balance) < p_amount THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient available credit';
  END IF;
  
  -- Update balance
  UPDATE accounts
    set balance = v_balance + p_amount
  WHERE idaccount = p_idaccount;
  
  -- Log transaction
  INSERT INTO log (idaccount, time, balancechange)
  VALUES (p_idaccount, NOW(), -p_amount);
  
  COMMIT;
END $$

DELIMITER ;



-- CREDIT REPAY
-- example CALL sp_credit_repay(idaccount, amount);

DELIMITER $$

CREATE PROCEDURE sp_credit_repay (
  IN p_idaccount INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_creditlimit DECIMAL(10,2);
  DECLARE v_balance DECIMAL(10,2);
  
  -- checks that added amount is not 0 or negative
  IF p_amount IS NULL OR p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount must be greater than 0';
  END IF;
  
  START TRANSACTION;
  
  -- Locks rows 
  SELECT creditlimit, balance
    INTO v_creditlimit, v_balance
    FROM accounts
  WHERE idaccount = p_idaccount
  FOR UPDATE;
  
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not found';
  END IF;
  
  -- Checks used credit amount
  IF v_balance < p_amount THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tried to pay too much';
  END IF;
  
  -- Update balance
  UPDATE accounts
    SET balance = v_balance - p_amount
  WHERE idaccount = p_idaccount;
  
  -- Log transaction
  INSERT INTO log (idaccount, time, balancechange)
  VALUES (p_idaccount, NOW(), p_amount);
  
  COMMIT;
END$$

DELIMITER ;

-- WHITDRAW
-- example CALL sp_withdraw(idaccount, amount);

DELIMITER $$

CREATE PROCEDURE sp_withdraw(
  IN p_idaccount INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_balance DECIMAL(10,2);

  -- checks that added amount is not 0 or negative
  IF p_amount IS NULL OR p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount must be greater than 0';
  END IF;
  
  START TRANSACTION;
  
  -- Locks rows 
  SELECT balance
    INTO v_balance
    FROM accounts
  WHERE idaccount = p_idaccount
  FOR UPDATE;  
  
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not found';
  END IF;

  -- Checks balance 
  IF v_balance < p_amount THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
  END IF; 
  
  -- Update balance
  UPDATE accounts
    SET balance = v_balance - p_amount
  WHERE idaccount = p_idaccount;
  
  -- Log transaction
  INSERT INTO log (idaccount, time, balancechange)
  VALUES (p_idaccount, NOW(), -p_amount);
  
  COMMIT;
END$$

DELIMITER ;

-- DEPOSIT
-- example CALL sp_deposit(idaccount, amount);

DELIMITER $$

CREATE PROCEDURE sp_deposit(
  IN p_idaccount INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE v_balance DECIMAL(10,2);

  -- checks that added amount is not 0 or negative
  IF p_amount IS NULL OR p_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount must be greater than 0';
  END IF;
  
  START TRANSACTION;
  
  -- Locks rows 
  SELECT balance
    INTO v_balance
    FROM accounts
  WHERE idaccount = p_idaccount
  FOR UPDATE;  
  
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not found';
  END IF;
  
  -- Update balance
  UPDATE accounts
    SET balance = v_balance + p_amount
  WHERE idaccount = p_idaccount;
  
  -- Log transaction
  INSERT INTO log (idaccount, time, balancechange)
  VALUES (p_idaccount, NOW(), p_amount);
  
  COMMIT;
END$$

DELIMITER ;
