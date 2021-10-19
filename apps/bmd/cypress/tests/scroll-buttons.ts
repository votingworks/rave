/* eslint-disable cypress/no-unnecessary-waiting */
describe('Scroll Buttons', () => {
  const waitTime = 500;

  it('Scroll buttons appear and function correctly', () => {
    cy.visit('/#demo');
    cy.wait(waitTime);
    cy.get('nav').contains('Start Voting').click();
    cy.contains('Next').click();
    cy.wait(waitTime);
    cy.contains('Next').click();
    cy.wait(waitTime);
    cy.contains('Brad Plunkard').should('be.visible');
    cy.queryByText('↑ See More', { timeout: 0 }).should('not.be.visible');
    cy.queryByText('↓ See More', { timeout: 0 }).should('not.be.visible');
    cy.contains('Next').click();
    cy.wait(waitTime);
    cy.get('button').should('have.length', 16 + 7); // 16 candidates + 7 UI
    cy.contains('Charlene Franz').should('be.visible');
    cy.get('.scroll-up').should('be.disabled');
    cy.get('.scroll-down').click();
    cy.wait(waitTime);
    cy.contains('Charlene Franz', { timeout: 0 }).should('not.be.visible');
    cy.get('.scroll-down').click();
    cy.wait(waitTime);
    cy.get('.scroll-down').click();
    cy.wait(waitTime);
    cy.contains('Henry Ash').should('be.visible');
    cy.get('.scroll-down').should('be.disabled');
    cy.get('.scroll-up').click();
    cy.wait(waitTime);
    cy.get('.scroll-up').click();
    cy.wait(waitTime);
    cy.get('.scroll-up').click();
    cy.wait(waitTime);
    cy.contains('Charlene Franz').should('be.visible');
  });
});
